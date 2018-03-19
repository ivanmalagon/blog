import React from 'react'

// Import typefaces
import 'typeface-montserrat'
import 'typeface-arvo'

import profilePic from './bio-pompas.jpg'
import { rhythm } from '../utils/typography'

class Bio extends React.Component {
  render() {
    return (
      <div
        style={{
          display: 'flex',
          marginBottom: rhythm(2.5),
        }}
      >
        <img
          src={profilePic}
          alt={`Ivan Malagon`}
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: 0,
            width: rhythm(2),
            height: rhythm(2),
          }}
        />
        <p>
          Written by <strong>Ivan Malagon,</strong> front-end lead at <a href="https://carto.com">CARTO</a> and Hip&nbsp;Hop nerd. So if you like coding or Rap music {' '}
          <a href="https://twitter.com/hacheka">
            you should follow me on Twitter
          </a> or you can drop me a line to hacheka·gmail_com
        </p>
      </div>
    )
  }
}

export default Bio
