const {execSync} = require ('child_process')
const fs = require('fs')
const http = require('http')
const path = require('path')

fs.readdirSync('input').forEach(async inputfile=>{
	console.log('process', inputfile)
	let inputfilepath = path.join('input', inputfile)
	let text = fs.readFileSync(inputfilepath).toString()
	//<img data-v-0046d8d1="" data-src="//img-qn.bookan.com.cn/jpage5/8330/8330-474472/8c9967ab_big.jpg" class="swiper-lazy">
	let list = text.match(/src="([^"]+.jpg)"/g)
	//<h1 class="mint-header-title">英语学习·中英文版</h1>
	let bookname = text.match(/<h1 class="mint-header-title">([^<]+)<\/h1>/)
	console.log(bookname[1])
	let dir = 'output/'+bookname[1]
	if (!fs.existsSync(dir))
		fs.mkdirSync(dir)

	list.forEach(async (item, id)=>{
		id = id + 1
		let r = item.match(/src="([^"]+)"/)
		let url = 'http:'+r[1]
		let fn = path.join(dir, (id<10?'0':'')+id+'.jpg')
		let user_agent='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36'
		console.log(url, ">>", fn)
		try{
			execSync(`curl -s -A "${user_agent}" -o ${fn} ${url}`)
		}
		catch (e){
			console.error('error', e)
		}
	})
})
