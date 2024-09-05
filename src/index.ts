#!/usr/bin/env node
import { program } from "commander";
import download from 'download-git-repo'
import { input,select } from '@inquirer/prompts';
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

process.on('SIGINT', () => {
  console.log('Received SIGINT. Gracefully shutting down...');

  // 这里可以添加你希望在退出之前执行的清理操作
  // 例如关闭数据库连接、保存状态等
  process.exit(0); // 成功退出，使用 exit code 0 表示正常退出
});
process.on('uncaughtException', (err) => {
  console.error('exit code 1');
  process.exit(1); // 使用非 0 值表示异常退出
});


log(chalk.blue('安装步骤') + ' 开始');

// program
//   .option('-d, --debug', 'output extra debugging')
//   .option('-s, --small', 'small pizza size')
//   .option('-p, --pizza-type <type>', 'flavour of pizza');
// 1. 文件名
const dirName = await input({ message: '请输入文件名!', required: true });

// 2. 选择模板
const templateType = await select({
  message: '请选择模板>',
  choices: [
    {
      name: 'default(h5)',
      value: 'default',
      description: '',
    },]
})

// 3. 开启loading
const spinner = ora('downloading template...').start();
// 仅限于公共仓库下载
// download('https://gitlab.feeyo.com: http://gitlab.feeyo.com/cfrontend/frontend-template.git', dirName,{}, (err: any) => {
//   console.log('download', err);
// 	spinner.succeed('成功')
// })

  const templateH5 = `git@gitlab.feeyo.com:cfrontend/frontend-template.git`

  const targetPath = path.join(process.cwd(), dirName)

// 4. 克隆仓库
  execSync(`git clone ${templateH5} ${targetPath}`, {
    stdio: [0, 1, 2], // we need this so node will print the command output
  })

  process.chdir(targetPath);
//5. 删除.git目录
  const dirToDelete = path.join(targetPath, '.git');
  fs.rmSync(dirToDelete, { recursive: true, force: true }); // 递归删除文件夹及其内容

  spinner.succeed('模板下载成功!')

  
// program.parse();

// const options = program.opts();

// if (options.debug) console.log(options);
// if (options.small) console.log('- small pizza size');
// if (options.pizzaType) console.log(`- ${options.pizzaType}`);

