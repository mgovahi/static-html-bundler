const FileManager = require('./modules/fileManager');
const PageParser = require('./modules/pageParser');
const Uglifire = require('./modules/uglifier');

class StaticHtmlBundler{
	constructor(
		fileManager =new FileManager(),
		pageParser = new PageParser(),
		uglifier = new Uglifire()
		) {
		
		this.fileManager = fileManager
		this.pageParser = pageParser
		
		this.uglifier = uglifier
		
	}
	bundle(options){
		this.tags = options.tags;
		this.inputHtmlPath = options.inputHtml;
		this.outputHtmlPath = options.outputHtml;
		this.distFolder = options.distFolder;
		this.sourceFolder = options.sourceFolder;
		this.distCssFolder = options.distCssFolder;
		this.distJsFolder = options.distJsFolder;

		//read input html
		var htmlData =  this.fileManager.readFile(this.inputHtmlPath);
		if(!htmlData) return;
		//start bundling according tags in tags option
		this.tags.forEach( tag => {
			htmlData = this.bundleTag(htmlData,tag)
		});

		this.fileManager.writeFile(htmlData,this.outputHtmlPath);
	}
	bundleTag(htmlData,tag){
		//get pathes between tags
		var pathes = this.pageParser.findPathesBetween(htmlData,tag.start,tag.end);
		
		//read pathes content and concat them
		var bundleContent = this.generateBundleContent(pathes);
		// write bundle content to new file
		this.writeOutput(tag.type,bundleContent,tag.name);
		
		// return html content with replaced new files path (script or link)
		return this.replaceBundleContent(htmlData,tag.start,tag.end,tag.name,tag.type);
	}
	generateBundleContent(pathes){
		var bundleList = [];
		pathes.forEach(path => {
			var fileData = this.fileManager.readFile("./"+this.sourceFolder+path.split("?")[0]);
			bundleList.push(fileData);
		});
		
		return bundleList;
	}
	writeOutput(type,content,name){
		var callWrite = {
			css : this.writeCss,
			js: this.writeJs
		}
		callWrite[type].call(this,content,name);
	}
	writeCss (content,name){
		this.fileManager.writeFile(this.uglifier.minifyCss(content.join("")),
		this.distFolder + this.distCssFolder + name + ".css");
	}
	writeJs(content,name){
		var jsContent = this.uglifier.minifyJs(content);
		if(jsContent){
			this.fileManager.writeFile(this.uglifier.minifyJs(jsContent),
			this.distFolder + this.distJsFolder + name + ".js")
		}
	}
	replaceBundleContent(content,start,end,name,type){
		var replaceData = {
			css : start +"<link rel='stylesheet' href='"+this.distCssFolder+ name + ".css"+"' />" +end,
			js : start +"<script src='"+this.distJsFolder+ name+".js"+"' ></script>"+end
		}
		
		return this.pageParser.findAndReplacePathesBetween(content,start,end,replaceData[type]);
	}
}


module.exports = new StaticHtmlBundler();





