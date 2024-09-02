#!/usr/bin/env node
import { program } from "commander";
import download from 'download-git-repo'
import { input } from '@inquirer/prompts';
import "tslib";


interface MyAnswers {
  name: string;
  language: string;
}

program
  .option('-d, --debug', 'output extra debugging')
  .option('-s, --small', 'small pizza size')
  .option('-p, --pizza-type <type>', 'flavour of pizza');

// program.version('0.0.2');

const dirName = await input({ message: 'Enter your dirName', required: true });
console.log('dirName', dirName);

download('QingHeSite/browser-custom', dirName,{}, (err: any) => {
  console.log('download', err);
})


// inquirer.prompt(questions)
//   .then((answers) => {
//     // Use user feedback for... whatever!!
//     console.log('answers', answers);
//     download('QingHeSite/browser-custom', 'browser',{}, (err: any) => {
//       console.log('download', err);
      
//     })

//   })
//   .catch((error) => {
//     console.log('error', error);

//     if (error.isTtyError) {
//       // Prompt couldn't be rendered in the current environment
//     } else {
//       // Something else went wrong
//     }
//   });
// program.command('create <name>').action(name => {
//   // 获取一些项目信息
//   inquirer.prompt([
//     {
//       name: 'author',
//       message: '你的名字是：'
//     }
//   ]).then(res => {
//     // 拿到信息参数
//     console.log('信息参数', res);

//     const { author, version, description } = res
//     const beginTime = new Date().getTime()
//     // download(`LeoJ340/webpack-template`, `./${name}`, err => {
//     //   const time = (new Date().getTime() - beginTime) / 1000
//     //   console.log(err || `create project finish in ${time}s`)
//     // })
//   })
// });






program.parse();

const options = program.opts();

if (options.debug) console.log(options);
if (options.small) console.log('- small pizza size');
if (options.pizzaType) console.log(`- ${options.pizzaType}`);





// console.log('脚手架运行!')
