# generator-netease-newsapp

> [Yeoman](http://yeoman.io) generator for netease newsapp development

> Now only support angularjs and sass.


## Getting Started

```
npm install -g yo
```


```
npm install -g generator-netease-newsapp
```


```
yo netease-newsapp
```

## Gulp Task

1.sass

`gulp sass` Compile sass file(.sass,.scss) to css file(.css).
 
2.style

`gulp style` Concat and minify css files from app/styles directory,then put them to build/styles.

3.script

`gulp script` Concat and minify javascript files from app/scripts directory,then put them to build/scripts.

4.server

`gulp server` Start a http server to serve the `app` directory.

5.build

`gulp build` Concat and minify the needed files.
 
6.deploy:resource
 
`gulp deploy:resource` Deploy the js and css files to the resource server then clear the CDN cache.

7.deploy:image

`gulp deploy:image` Deploy the image files to the image server. 

8.deploy:test

`gulp deploy:test` Redirect all the resource url to the local server then deploy the html files to the test server.

9.deploy:online

`gulp deploy:online` Redirect all the resource url to the online resource server then deploy the html files to the online server.

## License

MIT
