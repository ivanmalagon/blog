---
title: Adding data to a CARTO dataset
date: "2018-04-01T00:00:00.000Z"
---

## Eating our own dog food

In CARTO we have a Slack channel called `#using-carto` where [Iñigo](https://twitter.com/inigo_medina) sets a weekly challenge. We have to use CARTO tools to answer a very open question. Last week it was:

    I am visiting Madrid and a friend has given me her BiciMAD card.
    I love maps and above all maps made by myself. :)
    I wonder how I could create a map that allowed me  to see easily
    Madrid neighbourhoods and the BiciMAD parkings located in them.
    It would be great to select parkings with the greater capacity,
    so I could be fairly sure of finding a free place for my bike.

It's fun to see how we all end up answering the same question with different approaches. We have to document every step we take, pointing at the pains we discover along the way.

A common question here is _How can I insert data in CARTO to an existing dataset?_. My take this week with `#using-carto` is answering not the original challenge but this other question.

BiciMAD is the public bike service of Madrid. They provide an API to check the status of its station network. What I want to do is to feed a dataset in CARTO with the results of an API. It's a small dataset: 172 bike stations with 11 fields each, mostly numbers. It looks like a job for the SQL API!

## Updating your dataset via SQL API

As stated [in the docs](https://carto.com/docs/carto-engine/sql-api/), CARTO SQL API allows you to interact with your tables and data inside CARTO as if you were running SQL statements against a normal database. It even has batch queries to send long-running jobs to the database.

Using the BiciMAD bike stations info as an example, I'll show three different approaches to update your dataset. In all of them we'll have the restriction of using batch queries. They have a limitation of 16KB size, so we'll take that into account as we proceed.

### Replace all your data

If we don't need to save historical data, what we can do is to erase all data from the dataset and replace it with the result of the BiciMAD API call. This ensures to have our data up-to-date.

As we are using batch queries what we should do is:

1. Sort the records coming from the API by their ID. We need to delete only the records that will go in the current job. Having them sorted will allow us to know exactly the range of records we need to erase first.

2. Start writing the SELECT query.

```
INSERT INTO ${username}.${table} (id, name, dock_bikes, ... , the_geom) VALUES
```

3. Append the values for each record until it reaches the maximum size for a job, saving the first and last id

```
(1, 'Avda America', 24, ... ), 
(2, 'Quevedo', 15, ... ),
(3, 'Suchil', 7, ... ),
```

4. Create a DELETE query with the ids of the records that will go within this job.

```
DELETE FROM ${username}.${table} WHERE id >= 1 AND id <= 103
```

5. Create the job, setting first the DELETE query and then the INSERT one.

```
[
  "DELETE FROM ...",
  "INSERT INTO ...
]
```

#### PROS

- Easy to implement.
- Inserting multiple rows in the same SELECT statement allows us to fit more work into a single job.

#### CONS

- While the rows are being inserted, previous ones have already been deleted. It's a fast operation but you can see only part of the data in the meantime.

### Upsert

If you don't feel comfortable with seeing only part of the data while it's being updated, you can create UPSERT queries instead of a bulk delete and insert.

```
  // You need a unique index on `id` in order to get a conflict

  INSERT INTO ${username}.${table} (id, name, dock_bikes, ..., the_geom)
    VALUES (${values}, ${geom})
    ON CONFLICT (id) DO
      UPDATE SET ${keysAndValues}, the_geom=${geom};
  `;
```

#### PROS

- Data is always up to date. No visible glitchs while the jobs are running.

#### CONS

- Larger queries. That means less queries per job and then, more jobs to run.
- What do we do with records that die? In our case, if a station gets removed, since we're only inserting or updating, it'll be kept in the dataset. Fixing this would require more complex logic to compare the current data with the new one.


### Append new data

In this challenge it doesn't make sense the two previous approaches. If someone is interested in knowing real-time the bike availability, she'd use the official app. We cannot keep the same pace.

The use case that it's more interesting is to save the historical data of the stations, so we can run analyses later to get insights about the hotest stations or usage patterns.

And it's even easier than the two previous strategies. We only need to add a timestamp column and then using a multiple rows statement.

#### PROS

- Historical data.
- Easiest to implement.

#### CONS

- Table becomes very big if you append very often. You'd need to update less frequently or implement a expiry policy.

## Final implementation

I went for the third approach, updating the table every hour instead of aiming for 'real-time'.

I implemented a Google Cloud HTTP function that calls the API and then builds the batch query jobs. [The code of the function is in this Gist](https://gist.github.com/ivanmalagon/492fc7a92e54118df77f7a469cd277bb). Then, I use an uptime service that pings that URL every hour. I chose StatusCake but there are plenty of them. I did it like that for convenience but you can set a cron job from a server as well.

The dataset is public and growing. You can access it [here](https://team.carto.com/u/hacheka/tables/bicimad_inc/public). I plan to let it getting fat all April and then use the resulting dataset to run some analyses on it. Feel free to use it!


