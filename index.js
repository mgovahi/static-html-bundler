const htmlBundler = require("./html_bundler/htmlBundler");

const args = process.argv.slice(2);
var config_data = require("./"+args[0]);

htmlBundler.bundle({
	tags: config_data.tags,
	inputHtmlPath: config_data.inputHtml,
	outputHtmlPath: config_data.outputHtml,
	sourceFolder: config_data.sourceFolder,
	distFolder: config_data.distFolder,
	distCssFolder: config_data.cssFolder,
	distJsFolder: config_data.jsFolder
});