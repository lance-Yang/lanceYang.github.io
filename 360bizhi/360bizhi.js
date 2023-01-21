const download = require('download');
const axios = require('axios');
const fs = require('fs');
const _ = require('lodash');

let headers = {
	'User-Agent':
		'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'
};

function sleep(time) {
	return new Promise((reslove) => setTimeout(reslove, time));
}

async function wait(time) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve()
		}, time)
	})
}

const resouceList = [
	{
		cid: "36",
		category_id: "626253fd382d921b5e97079a",
		category_name: "4K专区",
		fileName: "4k"
	},
	{
		cid: "6",
		category_id: "626253fd382d921b5e97079d",
		category_name: "美女",
		fileName: "meinv"
	},
	{
		cid: "9",
		category_id: "626253fd382d921b5e9707a1",
		category_name: "风景",
		fileName: "fengjing"
	},
	{
		cid: "26",
		category_id: "626253fd382d921b5e97079b",
		category_name: "动漫",
		fileName: "dongman"
	},
	{
		cid: "11",
		category_id: "626253fd382d921b5e9707a3",
		category_name: "明星",
		fileName: "mingxing"
	},
	{
		cid: "14",
		category_id: "626253fd382d921b5e97079c",
		category_name: "萌宠",
		fileName: "mengchong"
	},
	{
		cid: "30",
		category_id: "626253fd382d921b5e9707a0",
		category_name: "爱情",
		fileName: "aiqing"
	},
	{
		cid: "15",
		category_id: "626253fd382d921b5e9707a2",
		category_name: "小清新",
		fileName: "xiaoqingxin"
	},
	{
		cid: "16",
		category_id: "",
		category_name: "节日",
		fileName: "jieri"
	},
	{
		cid: "13",
		category_id: "",
		category_name: "体育",
		fileName: "tiyun"
	},
	{
		cid: "5",
		category_id: "626253fd382d921b5e97079e",
		category_name: "游戏",
		fileName: "youxi"
	},
	{
		cid: "12",
		category_id: "626253fd382d921b5e97079f",
		category_name: "汽车",
		fileName: "qiche"
	},
]


let start = 0
async function load(cid, fileName,categoryId,categoryName) {
	
	const data = await axios
		.get('http://wallpaper.apc.360.cn/index.php', {
			headers,
			params: {
				start: start,
				count: 30,// 每页固定返回30条
				c: "WallPaper",
				a: 'getAppsByCategory',
				cid: cid,
				// from:'360chrome'
			}
		})
		.then((res) => {
			console.log(res.data.data, 'res...')
			return res.data.data
		})
		.catch((err) => {
			console.log(err);
		});
	const filePath = `${__dirname}/360bizhi/${fileName}.json`;

	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, '');
		start = 0
	} else {
		await writeJson(data, filePath,categoryId,categoryName);
		await sleep(3000);
		if (start < 1000) {
			start+=30;
			load(cid, fileName,categoryId,categoryName);
		} 
	}
	// const formatPath = `${__dirname}/360bizhi/target/aiqing.json`;
	// await writeJson(data, filePath);
	// await sleep(3000);
	// if (start < 1000) {
	// 	load(start + 30);
	// } else {
	//     await formaterJson(filePath,formatPath)
	// 	console.log('加载完成');
	// }
}


// 这是我根据我个人的一些项目写成一个json文件方便导入我的云数据库中
async function writeJson(sourceImgs, filePath,categoryId,categoryName) {
	fs.readFile(filePath, 'utf-8', (err, data) => {
		if (err) throw err;
		const imgArrays = JSON.parse(data) || [];
		_.map(sourceImgs, item => {
			const imgObj = _.find(imgArrays, i => i.imgId === item.id);
			if (!imgObj) {
				const obj = {
					imgId: item?.id,
					category_id: categoryId,
					category_name: categoryName,
					utag: item?.utag,
					url: item?.url,
					create_time: new Date(item?.create_time).getTime(),
					img_1600_900: item?.img_1600_900,
					img_1440_900: item?.img_1440_900,
					img_1366_768: item?.img_1366_768,
					img_1280_800: item?.img_1280_800,
					img_1280_1024: item?.img_1280_1024,
					img_1024_768: item?.img_1024_768,
				}
				imgArrays.push(obj)
			}
		})
		const str = JSON.stringify(imgArrays, '', '\t');
		fs.writeFile(filePath, str, (err) => {
			if (err) throw err;
			console.log('写入成功!');
		});
	});
}

// 格式化json文件，可以正确导入到云数据库
async function formaterJson(filePath, formaterPath) {
	fs.readFile(filePath, 'utf-8', (err, data) => {
		if (err) throw err;
		const imgArrays = JSON.parse(data) || [];
		console.log(imgArrays.length, 'imgArrays')

		_.map(imgArrays, item => {

			const content = `${JSON.stringify(item)}\n`

			fs.writeFile(formaterPath, content, { flag: 'a' }, (err) => {
				if (err) throw err;
				console.log('写入成功!');
			});
		})
	});
}


const filterUrl = () => {
	const filePath = `${__dirname}/动漫/dongman.json`;

	fs.readFile(filePath, 'utf-8', (err, data) => {
		if (err) throw err;
		const imgObj = JSON.parse(data);
		imgObj.image = data[0].wp;
		const tepmImgs = imgObj.images;

		const str = JSON.stringify(imgObj, '', '\t');

		fs.writeFile(filePath, str, (err) => {
			if (err) throw err;
			console.log('写入成功!');
		});
	});
};

async function downloadFile(data) {
	for (let index = 0; index < data.length; index++) {
		const item = data[index];

		// Path at which image will get downloaded
		const filePath = `${__dirname}/美女`;

		await download(item.wp, filePath, {
			filename: item.id + '.jpeg',
			headers
		}).then(() => {
			console.log(`Download ${item.id} Completed`);
			return;
		});
	}
}

resouceList.map(item => {
	load(item.cid,item.fileName,item.category_id,item.category_name)
})

load();

