const fs = require('fs')
const http = require('http')
const path = require('path')

fs.readdirSync('input').forEach(inputfile=>{
	let inputfilepath = path.join('input', inputfile)
	let text = fs.readFileSync(inputfilepath).toString()
	//<img data-v-0046d8d1="" data-src="//img-qn.bookan.com.cn/jpage5/8330/8330-474472/8c9967ab_big.jpg" class="swiper-lazy">
	let list = text.match(/data-src="([^"]+)"/g)

	function download(url, filename) {
		console.log(filename)
		let f = fs.createWriteStream(filename)
		http.get(url, function(response) {
		  response.pipe(f)
		})
	}

	let dir = 'output/'+inputfile.split('.')[0]
	if (!fs.existsSync(dir))
		fs.mkdirSync(dir)
	list.forEach((item, id)=>{
		id = id + 1
		let r = item.match(/data-src="([^"]+)"/)
		download('http:'+r[1], path.join(dir, (id<10?'0':'')+id+'.jpg'))
	})
})
