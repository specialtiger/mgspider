const fs = require('fs')
const PDFDocument = require('pdfkit')

function mkbm(bookmark) {
	let bm = {}
	bookmark.forEach(top=>{
		bm[top.page] = top
		let sublevels = {}
		top.sublevels.forEach(sub=>{
			sublevels[sub.page] = sub
		})
		top.sublevels = sublevels
	})
	return bm
}

function mkone(issue_info, dirname, bookmark) {
	bookmark = mkbm(bookmark)
	const doc = new PDFDocument()
	const {outline} = doc
	
	doc.pipe(fs.createWriteStream(dirname+'.pdf'))
	let list = fs.readdirSync(dirname)
	list.sort((a, b)=>{
		let numa = parseInt(a.match(/(\d+).jpg/))
		let numb = parseInt(b.match(/(\d+).jpg/))

		if (numa>numb)
			return 1
		if (numa<numb)
			return -1
		return 0
	})
	let curbm = {}
	let curtop = {}
	list.forEach((fn, k)=>{
		try{
			let page = parseInt(fn.match(/(\d+).jpg/))
			page -= issue_info.start
			console.log(dirname+'/'+fn, k)
			if (k>0){
				doc.addPage()
				let bm = bookmark[page]
				if (bm){
					curbm = bm
					curtop = outline.addItem(bm.name)
					let sub = curbm.sublevels[page]
					if (sub) {
						curtop.addItem(sub.name)
					}
				}
				else if (curbm && curtop && curbm.sublevels && curbm.sublevels[page]){
					let sub = curbm.sublevels[page]
					curtop.addItem(sub.name)
				}
			}
			doc.image(dirname+'/'+fn, 0, 0,
				{width:620, height:800})
		}catch(e){console.log(e)}
	})
	doc.end()
	console.log(dirname+'.pdf', 'done !')
}

function mkall(){
	fs.readdirSync('output').forEach(name=>{
	if (name.indexOf('.')!=-1)
		return
	mkone(name)
})
}


module.exports = {
	mkone,
	mkbm,
}

