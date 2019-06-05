# 🚄  Vitessce

Visual Integration Tool for Exploration of Spatial Single-Cell Experiments

- [Latest release demo](https://vitessce.io/)
- [Older demos](demos.md)
- [Older versions on NPM](https://www.npmjs.com/package/vitessce?activeTab=versions)

![Vitessce screenshot](https://user-images.githubusercontent.com/730388/58634506-78472580-82b9-11e9-9df8-a1362de73818.png)

## Data

The demo currently features data from the
[Linnarsson Lab](http://linnarssonlab.org/osmFISH/availability/),
with preprocessing done by [`vitessce-data`](https://github.com/hms-dbmi/vitessce-data).

## Development

Checkout the project, `cd`, and then:

```
$ npm install
$ npm start
```

The development server will refresh the browser as you edit the code.

- To run all the Travis checks: `./test.sh`
- To run just the unit tests: `npm run test:watch`
- To generate documentation: `npm run docz:dev`

## Deployment

### Demo

To build the current branch and push to S3:

```
$ ./push-demo.sh
```

This will open the demo deployment in your browser.

### Release

If you haven't already, push a fresh demo and
do a last [manual test](TESTING.md) of the deployment.
If it looks good, copy it to vitessce.io:

```
$ ./copy-prod.sh https://{url returned by push-demo.sh}
```

We publish to the NPM registry by hand:
Update the version number in `package.json` and run `npm publish`.

Finally, update the CHANGELOG.md to point to the new release on NPM.

## Old Presentations

- [2019 Harvard IT Summit](https://docs.google.com/presentation/d/1eYDMedzhQtcClB2cIBo17hlaSSAu_-vzkG4LY_mGGQ8/edit#slide=id.p)
- [Map 2019 lab meeting: Misc. tools](https://docs.google.com/presentation/d/1TaC68-r6bosnwi05BZ5bNh9tzeXsxyqmBo1gFZDxhGM/edit#slide=id.p)
- [April 2019 lab meeting: Software engineering](https://docs.google.com/presentation/d/1uW3J83LYaa67M9ZKe15AQw_h06QiFJBzpBickbRFcCY/edit#slide=id.p)
