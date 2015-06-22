# Neo4j Browser Proxy

Ever want to tweak Neo4j's pleasant built-in user interface,
but been intimidated by all the scary maven-y build stuff? This project is for you.


## Build and go

Requirements:

- [nodejs >=0.12.2](https://nodejs.org)

Steps:

1. Clone this repository
  - `git clone https://github.com/akollegger/neo4j-browser-proxy.git`
  - This'll take a while, as all of Neo4j comes along as a sub-module.
2. Get nodejs dependencies
  - `npm install`
3. Switch the Neo4j sub-module to the version you'd like to customize
  - `gulp neo4j-checkout --neo4j-version 2.3`
4. Build a local distribution, with some basic customization
  - `gulp build`
5. Run the nodejs proxying server
  - `node --harmony server.js`

### You've got options

Requests to `/db/data` will be proxied to [http://localhost:7474](http://localhost:7474).
If you're running Neo4j on a different host or port, use the `--neo4j` switch to indicate a different target URL.

    node --harmony server.js --neo4j http://someotherhost:1234

The proxying server.js can bind to a different port.

    node --harmony server.js --port 8998

When in doubt, check `--help` to see usage instructions.



## Make it your own

Neo4j Browser is a web application, combining [jade-templated content](http://jade-lang.com), [stylus-processed css](https://learnboost.github.io/stylus/),
and [coffeescript-compiled code](http://coffeescript.org) running in an [AngularJS](https://angularjs.org) framework. Any of it can be lifted from the Neo4j sub-module into the `./src`
subdirectory, where the build process will combine it into a customized application.

For instance, you'll notice a custom [./src/content/guides/start.jade](./src/content/guides/start.jade) which is presented in place of the default Neo4j start frame.

The Neo4j Browser `:play` command follows a simple convention for loading content from the `guides` subdirectory. New content you add will be available.


# License Notices

There are three things to know about licensing:

1. The `neo4j` submodule is entirely subject to Neo4j's licensing. Visit [neo4j.com](neo4j.com) for details.
2. All code &amp; content derived from Neo4j (like the modified copy of `start.jade`) is [GPLv3 licensed](http://www.gnu.org/licenses/gpl-3.0.en.html).
3. All top-level project files are [Apache v2 licensed](http://www.apache.org/licenses/LICENSE-2.0).  

Or, two things to know:

- GPLv3 for Neo4j and derived material
- Apache for original work that has no dependency on Neo4j
