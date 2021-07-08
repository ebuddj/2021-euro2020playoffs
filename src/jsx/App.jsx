import React, {Component} from 'react';
import style from './../styles/styles.less';

import * as topojson from 'topojson-client';

import * as d3 from 'd3';

import { IT } from 'round-flags';

// https://svgcrop.com/
import GB_EN from './../../media/img/uk-en-circle-01.png';

let flags = {};
flags['IT'] = IT;
flags['EN'] = GB_EN;

import constants from './Constants.jsx';

const projection = d3.geoAzimuthalEquidistant().center([30,63]).scale(820);

let svg, g, path;

function getHashValue(key) {
  let matches = location.hash.match(new RegExp(key+'=([^&]*)'));
  return matches ? matches[1] : null;
}

const timezone = getHashValue('timezone') ? getHashValue('timezone') : 'cest';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
    }
  }
  componentDidMount() {
    d3.csv('./data/data - ' + timezone + '.csv').then((data) => {
      this.setState((state, props) => ({
        data:data
      }), () => this.drawMap());
    })
    .catch(function (error) {
    })
    .then(function () {
    });
  }
  componentDidUpdate(prevProps, prevState, snapshot) {

  }
  componentWillUnMount() {

  }
  drawMap() {
    let width = 800;
    let height = 800;
    
    svg = d3.select('.' + style.map_container).append('svg').attr('width', width).attr('height', height);
    path = d3.geoPath().projection(projection);
    g = svg.append('g');

    d3.json('./data/europe.topojson').then((topology) => {
      // Add European countries.
      g.selectAll(style.path).data(topojson.feature(topology, topology.objects.europe).features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', style.path)
        .style('stroke', (d, i) => {
          return '#ccc';
        })
        .attr('fill', (d, i) => {
          return '#f5f5f5';
        });
      // Add Kosovo.
      g.append(style.path).datum({type:'Polygon',properties:{'NAME':'Kosovo'},coordinates:constants.kosovo})
        .attr('d', path)
        .attr('class', style.kosovo)
        .style('stroke', (d, i) => {
          return '#ccc';
        })
        .attr('fill', (d, i) => {
          return '#f5f5f5';
        });

      svg.selectAll('image').data(this.state.data)
        .enter()
        .append('svg:image')
        .attr('xlink:href', (d,i) => {
          return flags[d.country];
        })
        .attr('width', 100)
        .attr('height', 100)
        .attr('class', (d, i) => {
          return style.flag + ' stadium_' + d.id;
        })
        .attr('x', (d, i) => {
          return (d.position !== 'away') ? projection([d.lon, d.lat])[0] - 100 : projection([d.lon, d.lat])[0] + 5;
        })
        .attr('y', (d, i) => {
          return projection([d.lon, d.lat])[1] - 50;
        });

      svg.selectAll('text').data(this.state.data)
        .enter()
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'central')
         .attr('x', (d, i) => {
          return projection([d.lon, d.lat])[0];
        })
        .attr('y', (d, i) => {
          return projection([d.lon, d.lat])[1] - 60;
        }).html((d, i) => {
          return (d.position ==='away') ? '<tspan class="' + style.city + '">' + d.city + '</tspan><tspan class="' + style.datetime + '"> ' + d.date + ' ' + d.time + '<tspan>' : '';
        });
    });
  }
  // shouldComponentUpdate(nextProps, nextState) {}
  // static getDerivedStateFromProps(props, state) {}
  // getSnapshotBeforeUpdate(prevProps, prevState) {}
  // static getDerivedStateFromError(error) {}
  // componentDidCatch() {}
  render() {
    return (
      <div className={style.app}>
        <h3>{this.state.title}</h3>
        <div className={style.map_container}></div>
      </div>
    );
  }
}
export default App;