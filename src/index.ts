#!/usr/bin/env node
import { program } from "commander";
import download from 'download-git-repo'
import { input } from '@inquirer/prompts';
import ora from "ora"; //3.4.0 8.1.0
import chalk from 'chalk'
import { execSync }  from 'child_process';
import path from "node:path"
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import process from 'process'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const log = console.log;
log(chalk.blue('start') + ' install' + chalk.red('!'));
console.log(process.cwd());


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
console.log('save dirName', dirName);
const spinner = ora('Loading unicorns').start();

// 仅限于公共仓库下载
// download('https://gitlab.feeyo.com: http://gitlab.feeyo.com/cfrontend/frontend-template.git', dirName,{}, (err: any) => {
//   console.log('download', err);
// 	spinner.succeed('成功')
// })

const targetPath = path.join(process.cwd(), dirName)
  execSync(`git clone git@gitlab.feeyo.com:cfrontend/frontend-template.git ${targetPath}`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
  })

  process.chdir(targetPath);
  // 删除指定文件夹
  const dirToDelete = path.join(targetPath, '.git');
  fs.rmSync(dirToDelete, { recursive: true, force: true }); // 递归删除文件夹及其内容


spinner.succeed('模板下载成功!')


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






// program.parse();

// const options = program.opts();

// if (options.debug) console.log(options);
// if (options.small) console.log('- small pizza size');
// if (options.pizzaType) console.log(`- ${options.pizzaType}`);





// console.log('脚手架运行!')
