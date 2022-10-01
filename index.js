const { promisify } = require("util");
const globLibrary = require("glob");
const { promises: fs } = require("fs");
const { pascalCase } = require("change-case");
const glob = promisify(globLibrary);
const replaceInFiles = require("replace-in-files");

/**
 * @comment
 */ 

function getComponentName(path) {
	const pathNames = path.split("/");
	return pascalCase(pathNames[pathNames.length - 2]);
}

function getComponentNewPath(oldPath, newComponentName) {
	const pathNames = oldPath.split("/");
	pathNames.pop();
	pathNames.push(newComponentName + ".vue");
	return pathNames.join("/");
}

async function renameFile(oldFilePath) {
	const componentName = getComponentName(oldFilePath);
	const newFilePath = getComponentNewPath(oldFilePath, componentName);
	await fs.rename(oldFilePath, newFilePath);
}

function getImportPath(fileRelativePath) {
	fileRelativePathArray = fileRelativePath.split("/");

	let go = true;
	while (go) {
		const firstElement = fileRelativePathArray[0];
		fileRelativePathArray.shift();
		if (firstElement === "src") {
			go = false;
		}
	}
	fileRelativePathArray.pop();

	const newImportPathArray = [...fileRelativePathArray];
	newImportPathArray.push(fileRelativePathArray[fileRelativePathArray.length - 1]);

	return { oldImportPath: fileRelativePathArray.join("/"), newImportPath: newImportPathArray.join("/") };
}

async function replaceImportPath({ oldImportPath, newImportPath }) {
	const { paths } = await replaceInFiles({
		files: ["../../client/src/**/*.vue", "../../client/src/**/*.js"],
		from: oldImportPath,
		to: newImportPath,
		saveOldFile: false,
		onlyFindPathsWithoutReplace: false,
	});
	return paths;
}

(async () => {
		/*
			for (filePath of filesPaths) { const importPaths = getImportPath(filePath); await replaceImportPath(importPaths); }
			for (filePath of filesPaths) { await renameFile(filePath); }
		*/

	const pathsToFixString = "@/views/pages/Admin @/views/pages/Admin/Orders @/views/pages/Admin/Products @/views/pages/Admin/Profile @/views/pages/Admin/ShopProfile @/views/pages/Admin/StoreOrders @/views/pages/Draft @/views/pages/About @/views/pages/Payment @/views/pages/Home @/views/pages/Products @/views/pages/Products/List @/views/pages/Products/Single @/views/pages/Profile";
	const pathsToFix = pathsToFixString.split(" ");
	for (oldPath of pathsToFix) {
		const pathArray = oldPath.split("/");
		pathArray.push(pathArray[pathArray.length - 1]);
		const newPath = pathArray.join("/");
		await replaceImportPath({
			oldImportPath: oldPath,
			newImportPath: newPath,
		});
	}
})();
