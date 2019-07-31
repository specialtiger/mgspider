const {execSync} = require ('child_process')
const fs = require('fs')
const path = require('path')
const request = require('request-promise')
const util = require('util')
const mkpdf = require('./mkpdf')

// 音乐爱好者，英语学习，科幻世界，南风窗
// 搜索内容
// http://user.bookan.com.cn/index.php?op=Search.searchList&resourceType=1&keyword=英语学习&instanceId=1477&pageNum=1&limitNum=18
// 获取图片信息
// http://user.bookan.com.cn/index.php?op=Resource.issueInfoList&instanceId=1477&resourceType=1&issueIds=472447
// 获取图片hash
//Request URL: http://user.bookan.com.cn/index.php?op=Resource.getHash&resourceType=1&resourceId=7062&issueId=472447&start=1&end=52
// 获取书签
//http://user.bookan.com.cn/index.php?op=Resource.catalogInfo&resourceType=1&categoryId=472447&statusType=1

process.stdin.on('readable', oncmd)

let url = 'http://user.bookan.com.cn/index.php'
let qs = {
	op: 'Search.searchList',
	resourceType: 1,
	keyword: '英语学习',
	instanceId: 1477,
	pageNum: 1,
	limitNum: 100,
}


async function oncmd() {
	process.stdin.resume()
	let chunk = process.stdin.read()
	if (chunk == null) {
		return
	}
	let data = chunk.toString().trim()
	let cmd_args = data.split(" ")
	if (cmd_args.length == 0) {
		return
	}
	let cmd = cmd_args[0]
	if (cmd.length == 0)
		return
	qs.resourceType = 1

	if (cmd == 's'){
		qs.op = 'Search.searchList'
		qs.resourceType = 1
		qs.keyword = cmd_args[1]
	}
	else if (cmd == 'i'){
		qs.op = 'Resource.issueInfoList'
		qs.issueIds = cmd_args[1]
	}
	else if (cmd == 'c'){
		qs.op = 'Resource.catalogInfo'
		qs.categoryId = cmd_args[1]
	}
	else if (cmd == 'd'){
		download(cmd_args[1], cmd_args[2])
		return
	}
	else if (cmd == 'b'){
		qs.op = 'Search.searchList'
		qs.resourceType = 3
		qs.keyword = cmd_args[1]
	}
	else {
		qs.op = 'Search.searchList'
		qs.resourceType = 1
		qs.keyword = cmd
	}

	let r = await request.get({url, qs})
	if (qs.op == 'Search.searchList' && r){
		let content =  JSON.parse(r)
		content.data.sort((a, b)=>{
			if (a.issueId < b.issueId) 
				return 1
			if (a.issueId > b.issueId) 
				return -1
			return 0
		})
		content.data.forEach(item=>{
			console.log(item.issueId, item.resourceName, item.issueName, item.publish)
		})
	}
	else{
		console.log(r)
	}
}

async function download(issue_id, newname){
	qs.op = 'Resource.issueInfoList'
	qs.issueIds = issue_id
	let r = await request.get({url, qs})
	if (r.status == 1) {
		console.log(r)
		return
	}
	let issue_info = JSON.parse(r).data[0]
	// fs.writeFileSync(`output/${issue_id}_issue.json`, r.data)

	qs.op = 'Resource.catalogInfo'
	qs.categoryId = issue_id
	r = await request.get({url, qs})
	let catalog = JSON.parse(r).data
	// console.log(catalog)
	// fs.writeFileSync(`output/${issue_id}_catalog.json`, r.data)

	qs.op = 'Resource.getHash'
	qs.issueId = issue_id
	qs.resourceId = issue_info.resourceId
	qs.start = 1
	qs.end = issue_info.count
	r = await request.get({url, qs})
	let hashlist = JSON.parse(r).data
	// fs.writeFileSync(`output/${issue_id}_hash.json`, r.data)

	let dir = 'output/'+(newname?newname:issue_info.resourceName)
	if (issue_info.issueName && issue_info.issueName.length > 0)
		dir+=issue_info.issueName
	if (!fs.existsSync(dir))
		fs.mkdirSync(dir)


	hashlist.forEach(item=>{
		let url = getImgPath(issue_info, item.hash)
		let fn = path.join(dir, (item.page<10?'0':'')+item.page+'.jpg')
		console.log(url, ">>", fn)
		let user_agent='Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.130 Safari/537.36'
		execSync(`curl -s -A "${user_agent}" -o ${fn} ${url}`)
	})
	console.log(dir, 'done!')
	
	mkpdf.mkone(issue_info, dir, catalog)
}

function getImgPath(e, t) {
	let PAGE_SERVER = 'http://img-qn.bookan.com.cn'
    return PAGE_SERVER + "/jpage" + e.jpg + "/" + e.resourceId + "/" + e.resourceId + "-" + e.issueId + "/" + t + "_big.jpg"
}

function processtxt() {
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
}

