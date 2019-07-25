const {execSync} = require ('child_process')
const fs = require('fs')
const http = require('http')
const path = require('path')

// 搜索内容
// http://user.bookan.com.cn/index.php?op=Search.searchList&resourceType=1&keyword=英语学习&instanceId=1477&pageNum=1&limitNum=18
// 获取图片信息
// http://user.bookan.com.cn/index.php?op=Resource.issueInfoList&instanceId=1477&resourceType=1&issueIds=472447
// 获取图片hash
//Request URL: http://user.bookan.com.cn/index.php?op=Resource.getHash&resourceType=1&resourceId=7062&issueId=472447&start=1&end=52
// 获取书签
//http://user.bookan.com.cn/index.php?op=Resource.catalogInfo&resourceType=1&categoryId=472447&statusType=1

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
