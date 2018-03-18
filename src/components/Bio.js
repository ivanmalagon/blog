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
          alt={`Kyle Mathews`}
          style={{
            marginRight: rhythm(1 / 2),
            marginBottom: 0,
            width: rhythm(2),
            height: rhythm(2),
          }}
        />
        <p>
          Escrito por <strong>Ivan Malagon,</strong> front-end lead en <a href="https://carto.com">CARTO</a> y nerd del Hip-Hop.{' '}
          <a href="https://twitter.com/hacheka">
            Puedes seguirme en Twitter
          </a> o escribirme a hacheka·gmail_com
        </p>
      </div>
    )
  }
}

export default Bio
