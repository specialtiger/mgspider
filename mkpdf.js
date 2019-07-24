const fs = require('fs')
const PDFDocument = require('pdfkit')
fs.readdirSync('output').forEach(name=>{
	if (name.indexOf('.')!=-1)
		return
	let dirname = 'output/'+name
	const doc = new PDFDocument()
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
	list.forEach((fn, k)=>{
		try{
			console.log(dirname+'/'+fn, k)
			if (k>0)
				doc.addPage()
			doc.image(dirname+'/'+fn, 0, 0,
				{width:620, height:800})
		}catch(e){console.log(e)}
	})
	doc.end()
})



