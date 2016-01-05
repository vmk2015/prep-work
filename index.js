let http=require('http')
let request = require('request')
let path = require('path')
let fs = require('fs')
//let through=require('through')
let argv = require('yargs')
    .default('host','127.0.0.1')
    .argv
 let scheme = 'http://'
 let port = argv.port || (argv.host === '127.0.0.1' ? 8000 : 80)
 console.log(port, argv)
let destinationUrl = argv.url || scheme + argv.host +':' + port

let logPath = argv.log && path.join(__dirname, argv.log)
//let getLogStream = ()=> logPath ? fs.createWriteStream(logPath) : process.stdout
let logStream = logPath ? fs.createWriteStream(logPath) : process.stdout


http.createServer((req, res) => {

 for(let header in req.headers){
res.setHeader(header, req.headers[header])
}   
// process.stdout.write(`Request received at: ${req.url}`)
console.log(JSON.stringify(req.url))
logStream.write('Request received at:'+ JSON.stringify(req.url))
    req.pipe(logStream,{end: false})
    req.pipe(res)
    //res.end('hello world')
  
}).listen(port)


http.createServer((req, res) => {
	let url= destinationUrl
	if(req.headers['x-destination-url']){
url = req.headers['x-destination-url']
	}
	let options ={
	// headers: req.headers,
	url: url + req.url
}
//process.stdout.write('\n\n\n'+JSON.stringify(req.headers))
logStream.write('\nRequest headers: ' +'\n\n\n'+JSON.stringify(req.headers))
req.pipe(logStream,{end: false})
//through(req,logStream,{autoDestroy:false})

let destinationRes =req.pipe(request(options))
//process.stdout.write(JSON.stringify(destinationRes.headers))
logStream.write('\nDestinationRes.header'+JSON.stringify(destinationRes.headers)+'\n')
//logStream.write(`\nProxying request to:${destinationUrl + req.url})
//through(destinationRes,logStream,{autoDestroy : true})

//destinationRes.pipe(logStream)
res.pipe(logStream,{end:false})
destinationRes.pipe(res)
	// Proxy code here
}).listen(8001)
