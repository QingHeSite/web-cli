#!/usr/bin/env node
import require$$0$2 from 'node:events';
import require$$1 from 'node:child_process';
import require$$2 from 'node:path';
import require$$3$1 from 'node:fs';
import process$3 from 'node:process';
import require$$0$3 from 'fs';
import require$$1$1 from 'path';
import require$$0$4 from 'url';
import require$$4 from 'events';
import require$$1$2 from 'http';
import require$$0$5 from 'stream';
import require$$0$6 from 'os';
import 'net';
import require$$1$3 from 'tls';
import require$$3$2 from 'https';
import require$$5 from 'assert';
import require$$0$8 from 'util';
import require$$0$7 from 'buffer';
import require$$0$9 from 'constants';
import require$$6 from 'string_decoder';
import require$$1$4 from 'zlib';
import require$$6$1 from 'querystring';
import require$$1$5 from 'punycode';
import require$$26 from 'electron';
import require$$0$a from 'child_process';
import * as readline$1 from 'node:readline';
import { AsyncLocalStorage, AsyncResource } from 'node:async_hooks';
import require$$0$c from 'tty';
import require$$0$b from 'node:tty';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var commander = {};

var argument = {};

var error = {};

/**
 * CommanderError class
 */

let CommanderError$3 = class CommanderError extends Error {
  /**
   * Constructs the CommanderError class
   * @param {number} exitCode suggested exit code which could be used with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   */
  constructor(exitCode, code, message) {
    super(message);
    // properly capture stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code;
    this.exitCode = exitCode;
    this.nestedError = undefined;
  }
};

/**
 * InvalidArgumentError class
 */
let InvalidArgumentError$4 = class InvalidArgumentError extends CommanderError$3 {
  /**
   * Constructs the InvalidArgumentError class
   * @param {string} [message] explanation of why argument is invalid
   */
  constructor(message) {
    super(1, 'commander.invalidArgument', message);
    // properly capture stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
};

error.CommanderError = CommanderError$3;
error.InvalidArgumentError = InvalidArgumentError$4;

const { InvalidArgumentError: InvalidArgumentError$3 } = error;

let Argument$3 = class Argument {
  /**
   * Initialize a new command argument with the given name and description.
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @param {string} name
   * @param {string} [description]
   */

  constructor(name, description) {
    this.description = description || '';
    this.variadic = false;
    this.parseArg = undefined;
    this.defaultValue = undefined;
    this.defaultValueDescription = undefined;
    this.argChoices = undefined;

    switch (name[0]) {
      case '<': // e.g. <required>
        this.required = true;
        this._name = name.slice(1, -1);
        break;
      case '[': // e.g. [optional]
        this.required = false;
        this._name = name.slice(1, -1);
        break;
      default:
        this.required = true;
        this._name = name;
        break;
    }

    if (this._name.length > 3 && this._name.slice(-3) === '...') {
      this.variadic = true;
      this._name = this._name.slice(0, -3);
    }
  }

  /**
   * Return argument name.
   *
   * @return {string}
   */

  name() {
    return this._name;
  }

  /**
   * @package
   */

  _concatValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }

    return previous.concat(value);
  }

  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {*} value
   * @param {string} [description]
   * @return {Argument}
   */

  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }

  /**
   * Set the custom handler for processing CLI command arguments into argument values.
   *
   * @param {Function} [fn]
   * @return {Argument}
   */

  argParser(fn) {
    this.parseArg = fn;
    return this;
  }

  /**
   * Only allow argument value to be one of choices.
   *
   * @param {string[]} values
   * @return {Argument}
   */

  choices(values) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError$3(
          `Allowed choices are ${this.argChoices.join(', ')}.`,
        );
      }
      if (this.variadic) {
        return this._concatValue(arg, previous);
      }
      return arg;
    };
    return this;
  }

  /**
   * Make argument required.
   *
   * @returns {Argument}
   */
  argRequired() {
    this.required = true;
    return this;
  }

  /**
   * Make argument optional.
   *
   * @returns {Argument}
   */
  argOptional() {
    this.required = false;
    return this;
  }
};

/**
 * Takes an argument and returns its human readable equivalent for help usage.
 *
 * @param {Argument} arg
 * @return {string}
 * @private
 */

function humanReadableArgName$2(arg) {
  const nameOutput = arg.name() + (arg.variadic === true ? '...' : '');

  return arg.required ? '<' + nameOutput + '>' : '[' + nameOutput + ']';
}

argument.Argument = Argument$3;
argument.humanReadableArgName = humanReadableArgName$2;

var command = {};

var help = {};

const { humanReadableArgName: humanReadableArgName$1 } = argument;

/**
 * TypeScript import types for JSDoc, used by Visual Studio Code IntelliSense and `npm run typescript-checkJS`
 * https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import-types
 * @typedef { import("./argument.js").Argument } Argument
 * @typedef { import("./command.js").Command } Command
 * @typedef { import("./option.js").Option } Option
 */

// Although this is a class, methods are static in style to allow override using subclass or just functions.
let Help$3 = class Help {
  constructor() {
    this.helpWidth = undefined;
    this.sortSubcommands = false;
    this.sortOptions = false;
    this.showGlobalOptions = false;
  }

  /**
   * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
   *
   * @param {Command} cmd
   * @returns {Command[]}
   */

  visibleCommands(cmd) {
    const visibleCommands = cmd.commands.filter((cmd) => !cmd._hidden);
    const helpCommand = cmd._getHelpCommand();
    if (helpCommand && !helpCommand._hidden) {
      visibleCommands.push(helpCommand);
    }
    if (this.sortSubcommands) {
      visibleCommands.sort((a, b) => {
        // @ts-ignore: because overloaded return type
        return a.name().localeCompare(b.name());
      });
    }
    return visibleCommands;
  }

  /**
   * Compare options for sort.
   *
   * @param {Option} a
   * @param {Option} b
   * @returns {number}
   */
  compareOptions(a, b) {
    const getSortKey = (option) => {
      // WYSIWYG for order displayed in help. Short used for comparison if present. No special handling for negated.
      return option.short
        ? option.short.replace(/^-/, '')
        : option.long.replace(/^--/, '');
    };
    return getSortKey(a).localeCompare(getSortKey(b));
  }

  /**
   * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
   *
   * @param {Command} cmd
   * @returns {Option[]}
   */

  visibleOptions(cmd) {
    const visibleOptions = cmd.options.filter((option) => !option.hidden);
    // Built-in help option.
    const helpOption = cmd._getHelpOption();
    if (helpOption && !helpOption.hidden) {
      // Automatically hide conflicting flags. Bit dubious but a historical behaviour that is convenient for single-command programs.
      const removeShort = helpOption.short && cmd._findOption(helpOption.short);
      const removeLong = helpOption.long && cmd._findOption(helpOption.long);
      if (!removeShort && !removeLong) {
        visibleOptions.push(helpOption); // no changes needed
      } else if (helpOption.long && !removeLong) {
        visibleOptions.push(
          cmd.createOption(helpOption.long, helpOption.description),
        );
      } else if (helpOption.short && !removeShort) {
        visibleOptions.push(
          cmd.createOption(helpOption.short, helpOption.description),
        );
      }
    }
    if (this.sortOptions) {
      visibleOptions.sort(this.compareOptions);
    }
    return visibleOptions;
  }

  /**
   * Get an array of the visible global options. (Not including help.)
   *
   * @param {Command} cmd
   * @returns {Option[]}
   */

  visibleGlobalOptions(cmd) {
    if (!this.showGlobalOptions) return [];

    const globalOptions = [];
    for (
      let ancestorCmd = cmd.parent;
      ancestorCmd;
      ancestorCmd = ancestorCmd.parent
    ) {
      const visibleOptions = ancestorCmd.options.filter(
        (option) => !option.hidden,
      );
      globalOptions.push(...visibleOptions);
    }
    if (this.sortOptions) {
      globalOptions.sort(this.compareOptions);
    }
    return globalOptions;
  }

  /**
   * Get an array of the arguments if any have a description.
   *
   * @param {Command} cmd
   * @returns {Argument[]}
   */

  visibleArguments(cmd) {
    // Side effect! Apply the legacy descriptions before the arguments are displayed.
    if (cmd._argsDescription) {
      cmd.registeredArguments.forEach((argument) => {
        argument.description =
          argument.description || cmd._argsDescription[argument.name()] || '';
      });
    }

    // If there are any arguments with a description then return all the arguments.
    if (cmd.registeredArguments.find((argument) => argument.description)) {
      return cmd.registeredArguments;
    }
    return [];
  }

  /**
   * Get the command term to show in the list of subcommands.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  subcommandTerm(cmd) {
    // Legacy. Ignores custom usage string, and nested commands.
    const args = cmd.registeredArguments
      .map((arg) => humanReadableArgName$1(arg))
      .join(' ');
    return (
      cmd._name +
      (cmd._aliases[0] ? '|' + cmd._aliases[0] : '') +
      (cmd.options.length ? ' [options]' : '') + // simplistic check for non-help option
      (args ? ' ' + args : '')
    );
  }

  /**
   * Get the option term to show in the list of options.
   *
   * @param {Option} option
   * @returns {string}
   */

  optionTerm(option) {
    return option.flags;
  }

  /**
   * Get the argument term to show in the list of arguments.
   *
   * @param {Argument} argument
   * @returns {string}
   */

  argumentTerm(argument) {
    return argument.name();
  }

  /**
   * Get the longest command term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestSubcommandTermLength(cmd, helper) {
    return helper.visibleCommands(cmd).reduce((max, command) => {
      return Math.max(max, helper.subcommandTerm(command).length);
    }, 0);
  }

  /**
   * Get the longest option term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestOptionTermLength(cmd, helper) {
    return helper.visibleOptions(cmd).reduce((max, option) => {
      return Math.max(max, helper.optionTerm(option).length);
    }, 0);
  }

  /**
   * Get the longest global option term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestGlobalOptionTermLength(cmd, helper) {
    return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
      return Math.max(max, helper.optionTerm(option).length);
    }, 0);
  }

  /**
   * Get the longest argument term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestArgumentTermLength(cmd, helper) {
    return helper.visibleArguments(cmd).reduce((max, argument) => {
      return Math.max(max, helper.argumentTerm(argument).length);
    }, 0);
  }

  /**
   * Get the command usage to be displayed at the top of the built-in help.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  commandUsage(cmd) {
    // Usage
    let cmdName = cmd._name;
    if (cmd._aliases[0]) {
      cmdName = cmdName + '|' + cmd._aliases[0];
    }
    let ancestorCmdNames = '';
    for (
      let ancestorCmd = cmd.parent;
      ancestorCmd;
      ancestorCmd = ancestorCmd.parent
    ) {
      ancestorCmdNames = ancestorCmd.name() + ' ' + ancestorCmdNames;
    }
    return ancestorCmdNames + cmdName + ' ' + cmd.usage();
  }

  /**
   * Get the description for the command.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  commandDescription(cmd) {
    // @ts-ignore: because overloaded return type
    return cmd.description();
  }

  /**
   * Get the subcommand summary to show in the list of subcommands.
   * (Fallback to description for backwards compatibility.)
   *
   * @param {Command} cmd
   * @returns {string}
   */

  subcommandDescription(cmd) {
    // @ts-ignore: because overloaded return type
    return cmd.summary() || cmd.description();
  }

  /**
   * Get the option description to show in the list of options.
   *
   * @param {Option} option
   * @return {string}
   */

  optionDescription(option) {
    const extraInfo = [];

    if (option.argChoices) {
      extraInfo.push(
        // use stringify to match the display of the default value
        `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(', ')}`,
      );
    }
    if (option.defaultValue !== undefined) {
      // default for boolean and negated more for programmer than end user,
      // but show true/false for boolean option as may be for hand-rolled env or config processing.
      const showDefault =
        option.required ||
        option.optional ||
        (option.isBoolean() && typeof option.defaultValue === 'boolean');
      if (showDefault) {
        extraInfo.push(
          `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`,
        );
      }
    }
    // preset for boolean and negated are more for programmer than end user
    if (option.presetArg !== undefined && option.optional) {
      extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
    }
    if (option.envVar !== undefined) {
      extraInfo.push(`env: ${option.envVar}`);
    }
    if (extraInfo.length > 0) {
      return `${option.description} (${extraInfo.join(', ')})`;
    }

    return option.description;
  }

  /**
   * Get the argument description to show in the list of arguments.
   *
   * @param {Argument} argument
   * @return {string}
   */

  argumentDescription(argument) {
    const extraInfo = [];
    if (argument.argChoices) {
      extraInfo.push(
        // use stringify to match the display of the default value
        `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(', ')}`,
      );
    }
    if (argument.defaultValue !== undefined) {
      extraInfo.push(
        `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`,
      );
    }
    if (extraInfo.length > 0) {
      const extraDescripton = `(${extraInfo.join(', ')})`;
      if (argument.description) {
        return `${argument.description} ${extraDescripton}`;
      }
      return extraDescripton;
    }
    return argument.description;
  }

  /**
   * Generate the built-in help text.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {string}
   */

  formatHelp(cmd, helper) {
    const termWidth = helper.padWidth(cmd, helper);
    const helpWidth = helper.helpWidth || 80;
    const itemIndentWidth = 2;
    const itemSeparatorWidth = 2; // between term and description
    function formatItem(term, description) {
      if (description) {
        const fullText = `${term.padEnd(termWidth + itemSeparatorWidth)}${description}`;
        return helper.wrap(
          fullText,
          helpWidth - itemIndentWidth,
          termWidth + itemSeparatorWidth,
        );
      }
      return term;
    }
    function formatList(textArray) {
      return textArray.join('\n').replace(/^/gm, ' '.repeat(itemIndentWidth));
    }

    // Usage
    let output = [`Usage: ${helper.commandUsage(cmd)}`, ''];

    // Description
    const commandDescription = helper.commandDescription(cmd);
    if (commandDescription.length > 0) {
      output = output.concat([
        helper.wrap(commandDescription, helpWidth, 0),
        '',
      ]);
    }

    // Arguments
    const argumentList = helper.visibleArguments(cmd).map((argument) => {
      return formatItem(
        helper.argumentTerm(argument),
        helper.argumentDescription(argument),
      );
    });
    if (argumentList.length > 0) {
      output = output.concat(['Arguments:', formatList(argumentList), '']);
    }

    // Options
    const optionList = helper.visibleOptions(cmd).map((option) => {
      return formatItem(
        helper.optionTerm(option),
        helper.optionDescription(option),
      );
    });
    if (optionList.length > 0) {
      output = output.concat(['Options:', formatList(optionList), '']);
    }

    if (this.showGlobalOptions) {
      const globalOptionList = helper
        .visibleGlobalOptions(cmd)
        .map((option) => {
          return formatItem(
            helper.optionTerm(option),
            helper.optionDescription(option),
          );
        });
      if (globalOptionList.length > 0) {
        output = output.concat([
          'Global Options:',
          formatList(globalOptionList),
          '',
        ]);
      }
    }

    // Commands
    const commandList = helper.visibleCommands(cmd).map((cmd) => {
      return formatItem(
        helper.subcommandTerm(cmd),
        helper.subcommandDescription(cmd),
      );
    });
    if (commandList.length > 0) {
      output = output.concat(['Commands:', formatList(commandList), '']);
    }

    return output.join('\n');
  }

  /**
   * Calculate the pad width from the maximum term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  padWidth(cmd, helper) {
    return Math.max(
      helper.longestOptionTermLength(cmd, helper),
      helper.longestGlobalOptionTermLength(cmd, helper),
      helper.longestSubcommandTermLength(cmd, helper),
      helper.longestArgumentTermLength(cmd, helper),
    );
  }

  /**
   * Wrap the given string to width characters per line, with lines after the first indented.
   * Do not wrap if insufficient room for wrapping (minColumnWidth), or string is manually formatted.
   *
   * @param {string} str
   * @param {number} width
   * @param {number} indent
   * @param {number} [minColumnWidth=40]
   * @return {string}
   *
   */

  wrap(str, width, indent, minColumnWidth = 40) {
    // Full \s characters, minus the linefeeds.
    const indents =
      ' \\f\\t\\v\u00a0\u1680\u2000-\u200a\u202f\u205f\u3000\ufeff';
    // Detect manually wrapped and indented strings by searching for line break followed by spaces.
    const manualIndent = new RegExp(`[\\n][${indents}]+`);
    if (str.match(manualIndent)) return str;
    // Do not wrap if not enough room for a wrapped column of text (as could end up with a word per line).
    const columnWidth = width - indent;
    if (columnWidth < minColumnWidth) return str;

    const leadingStr = str.slice(0, indent);
    const columnText = str.slice(indent).replace('\r\n', '\n');
    const indentString = ' '.repeat(indent);
    const zeroWidthSpace = '\u200B';
    const breaks = `\\s${zeroWidthSpace}`;
    // Match line end (so empty lines don't collapse),
    // or as much text as will fit in column, or excess text up to first break.
    const regex = new RegExp(
      `\n|.{1,${columnWidth - 1}}([${breaks}]|$)|[^${breaks}]+?([${breaks}]|$)`,
      'g',
    );
    const lines = columnText.match(regex) || [];
    return (
      leadingStr +
      lines
        .map((line, i) => {
          if (line === '\n') return ''; // preserve empty lines
          return (i > 0 ? indentString : '') + line.trimEnd();
        })
        .join('\n')
    );
  }
};

help.Help = Help$3;

var option = {};

const { InvalidArgumentError: InvalidArgumentError$2 } = error;

let Option$3 = class Option {
  /**
   * Initialize a new `Option` with the given `flags` and `description`.
   *
   * @param {string} flags
   * @param {string} [description]
   */

  constructor(flags, description) {
    this.flags = flags;
    this.description = description || '';

    this.required = flags.includes('<'); // A value must be supplied when the option is specified.
    this.optional = flags.includes('['); // A value is optional when the option is specified.
    // variadic test ignores <value,...> et al which might be used to describe custom splitting of single argument
    this.variadic = /\w\.\.\.[>\]]$/.test(flags); // The option can take multiple values.
    this.mandatory = false; // The option must have a value after parsing, which usually means it must be specified on command line.
    const optionFlags = splitOptionFlags(flags);
    this.short = optionFlags.shortFlag;
    this.long = optionFlags.longFlag;
    this.negate = false;
    if (this.long) {
      this.negate = this.long.startsWith('--no-');
    }
    this.defaultValue = undefined;
    this.defaultValueDescription = undefined;
    this.presetArg = undefined;
    this.envVar = undefined;
    this.parseArg = undefined;
    this.hidden = false;
    this.argChoices = undefined;
    this.conflictsWith = [];
    this.implied = undefined;
  }

  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {*} value
   * @param {string} [description]
   * @return {Option}
   */

  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }

  /**
   * Preset to use when option used without option-argument, especially optional but also boolean and negated.
   * The custom processing (parseArg) is called.
   *
   * @example
   * new Option('--color').default('GREYSCALE').preset('RGB');
   * new Option('--donate [amount]').preset('20').argParser(parseFloat);
   *
   * @param {*} arg
   * @return {Option}
   */

  preset(arg) {
    this.presetArg = arg;
    return this;
  }

  /**
   * Add option name(s) that conflict with this option.
   * An error will be displayed if conflicting options are found during parsing.
   *
   * @example
   * new Option('--rgb').conflicts('cmyk');
   * new Option('--js').conflicts(['ts', 'jsx']);
   *
   * @param {(string | string[])} names
   * @return {Option}
   */

  conflicts(names) {
    this.conflictsWith = this.conflictsWith.concat(names);
    return this;
  }

  /**
   * Specify implied option values for when this option is set and the implied options are not.
   *
   * The custom processing (parseArg) is not called on the implied values.
   *
   * @example
   * program
   *   .addOption(new Option('--log', 'write logging information to file'))
   *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
   *
   * @param {object} impliedOptionValues
   * @return {Option}
   */
  implies(impliedOptionValues) {
    let newImplied = impliedOptionValues;
    if (typeof impliedOptionValues === 'string') {
      // string is not documented, but easy mistake and we can do what user probably intended.
      newImplied = { [impliedOptionValues]: true };
    }
    this.implied = Object.assign(this.implied || {}, newImplied);
    return this;
  }

  /**
   * Set environment variable to check for option value.
   *
   * An environment variable is only used if when processed the current option value is
   * undefined, or the source of the current value is 'default' or 'config' or 'env'.
   *
   * @param {string} name
   * @return {Option}
   */

  env(name) {
    this.envVar = name;
    return this;
  }

  /**
   * Set the custom handler for processing CLI option arguments into option values.
   *
   * @param {Function} [fn]
   * @return {Option}
   */

  argParser(fn) {
    this.parseArg = fn;
    return this;
  }

  /**
   * Whether the option is mandatory and must have a value after parsing.
   *
   * @param {boolean} [mandatory=true]
   * @return {Option}
   */

  makeOptionMandatory(mandatory = true) {
    this.mandatory = !!mandatory;
    return this;
  }

  /**
   * Hide option in help.
   *
   * @param {boolean} [hide=true]
   * @return {Option}
   */

  hideHelp(hide = true) {
    this.hidden = !!hide;
    return this;
  }

  /**
   * @package
   */

  _concatValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }

    return previous.concat(value);
  }

  /**
   * Only allow option value to be one of choices.
   *
   * @param {string[]} values
   * @return {Option}
   */

  choices(values) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError$2(
          `Allowed choices are ${this.argChoices.join(', ')}.`,
        );
      }
      if (this.variadic) {
        return this._concatValue(arg, previous);
      }
      return arg;
    };
    return this;
  }

  /**
   * Return option name.
   *
   * @return {string}
   */

  name() {
    if (this.long) {
      return this.long.replace(/^--/, '');
    }
    return this.short.replace(/^-/, '');
  }

  /**
   * Return option name, in a camelcase format that can be used
   * as a object attribute key.
   *
   * @return {string}
   */

  attributeName() {
    return camelcase(this.name().replace(/^no-/, ''));
  }

  /**
   * Check if `arg` matches the short or long flag.
   *
   * @param {string} arg
   * @return {boolean}
   * @package
   */

  is(arg) {
    return this.short === arg || this.long === arg;
  }

  /**
   * Return whether a boolean option.
   *
   * Options are one of boolean, negated, required argument, or optional argument.
   *
   * @return {boolean}
   * @package
   */

  isBoolean() {
    return !this.required && !this.optional && !this.negate;
  }
};

/**
 * This class is to make it easier to work with dual options, without changing the existing
 * implementation. We support separate dual options for separate positive and negative options,
 * like `--build` and `--no-build`, which share a single option value. This works nicely for some
 * use cases, but is tricky for others where we want separate behaviours despite
 * the single shared option value.
 */
let DualOptions$1 = class DualOptions {
  /**
   * @param {Option[]} options
   */
  constructor(options) {
    this.positiveOptions = new Map();
    this.negativeOptions = new Map();
    this.dualOptions = new Set();
    options.forEach((option) => {
      if (option.negate) {
        this.negativeOptions.set(option.attributeName(), option);
      } else {
        this.positiveOptions.set(option.attributeName(), option);
      }
    });
    this.negativeOptions.forEach((value, key) => {
      if (this.positiveOptions.has(key)) {
        this.dualOptions.add(key);
      }
    });
  }

  /**
   * Did the value come from the option, and not from possible matching dual option?
   *
   * @param {*} value
   * @param {Option} option
   * @returns {boolean}
   */
  valueFromOption(value, option) {
    const optionKey = option.attributeName();
    if (!this.dualOptions.has(optionKey)) return true;

    // Use the value to deduce if (probably) came from the option.
    const preset = this.negativeOptions.get(optionKey).presetArg;
    const negativeValue = preset !== undefined ? preset : false;
    return option.negate === (negativeValue === value);
  }
};

/**
 * Convert string from kebab-case to camelCase.
 *
 * @param {string} str
 * @return {string}
 * @private
 */

function camelcase(str) {
  return str.split('-').reduce((str, word) => {
    return str + word[0].toUpperCase() + word.slice(1);
  });
}

/**
 * Split the short and long flag out of something like '-m,--mixed <value>'
 *
 * @private
 */

function splitOptionFlags(flags) {
  let shortFlag;
  let longFlag;
  // Use original very loose parsing to maintain backwards compatibility for now,
  // which allowed for example unintended `-sw, --short-word` [sic].
  const flagParts = flags.split(/[ |,]+/);
  if (flagParts.length > 1 && !/^[[<]/.test(flagParts[1]))
    shortFlag = flagParts.shift();
  longFlag = flagParts.shift();
  // Add support for lone short flag without significantly changing parsing!
  if (!shortFlag && /^-[^-]$/.test(longFlag)) {
    shortFlag = longFlag;
    longFlag = undefined;
  }
  return { shortFlag, longFlag };
}

option.Option = Option$3;
option.DualOptions = DualOptions$1;

var suggestSimilar$2 = {};

const maxDistance = 3;

function editDistance(a, b) {
  // https://en.wikipedia.org/wiki/Damerau–Levenshtein_distance
  // Calculating optimal string alignment distance, no substring is edited more than once.
  // (Simple implementation.)

  // Quick early exit, return worst case.
  if (Math.abs(a.length - b.length) > maxDistance)
    return Math.max(a.length, b.length);

  // distance between prefix substrings of a and b
  const d = [];

  // pure deletions turn a into empty string
  for (let i = 0; i <= a.length; i++) {
    d[i] = [i];
  }
  // pure insertions turn empty string into b
  for (let j = 0; j <= b.length; j++) {
    d[0][j] = j;
  }

  // fill matrix
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      let cost = 1;
      if (a[i - 1] === b[j - 1]) {
        cost = 0;
      } else {
        cost = 1;
      }
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost, // substitution
      );
      // transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[a.length][b.length];
}

/**
 * Find close matches, restricted to same number of edits.
 *
 * @param {string} word
 * @param {string[]} candidates
 * @returns {string}
 */

function suggestSimilar$1(word, candidates) {
  if (!candidates || candidates.length === 0) return '';
  // remove possible duplicates
  candidates = Array.from(new Set(candidates));

  const searchingOptions = word.startsWith('--');
  if (searchingOptions) {
    word = word.slice(2);
    candidates = candidates.map((candidate) => candidate.slice(2));
  }

  let similar = [];
  let bestDistance = maxDistance;
  const minSimilarity = 0.4;
  candidates.forEach((candidate) => {
    if (candidate.length <= 1) return; // no one character guesses

    const distance = editDistance(word, candidate);
    const length = Math.max(word.length, candidate.length);
    const similarity = (length - distance) / length;
    if (similarity > minSimilarity) {
      if (distance < bestDistance) {
        // better edit distance, throw away previous worse matches
        bestDistance = distance;
        similar = [candidate];
      } else if (distance === bestDistance) {
        similar.push(candidate);
      }
    }
  });

  similar.sort((a, b) => a.localeCompare(b));
  if (searchingOptions) {
    similar = similar.map((candidate) => `--${candidate}`);
  }

  if (similar.length > 1) {
    return `\n(Did you mean one of ${similar.join(', ')}?)`;
  }
  if (similar.length === 1) {
    return `\n(Did you mean ${similar[0]}?)`;
  }
  return '';
}

suggestSimilar$2.suggestSimilar = suggestSimilar$1;

const EventEmitter$5 = require$$0$2.EventEmitter;
const childProcess = require$$1;
const path$b = require$$2;
const fs$b = require$$3$1;
const process$2 = process$3;

const { Argument: Argument$2, humanReadableArgName } = argument;
const { CommanderError: CommanderError$2 } = error;
const { Help: Help$2 } = help;
const { Option: Option$2, DualOptions } = option;
const { suggestSimilar } = suggestSimilar$2;

let Command$2 = class Command extends EventEmitter$5 {
  /**
   * Initialize a new `Command`.
   *
   * @param {string} [name]
   */

  constructor(name) {
    super();
    /** @type {Command[]} */
    this.commands = [];
    /** @type {Option[]} */
    this.options = [];
    this.parent = null;
    this._allowUnknownOption = false;
    this._allowExcessArguments = true;
    /** @type {Argument[]} */
    this.registeredArguments = [];
    this._args = this.registeredArguments; // deprecated old name
    /** @type {string[]} */
    this.args = []; // cli args with options removed
    this.rawArgs = [];
    this.processedArgs = []; // like .args but after custom processing and collecting variadic
    this._scriptPath = null;
    this._name = name || '';
    this._optionValues = {};
    this._optionValueSources = {}; // default, env, cli etc
    this._storeOptionsAsProperties = false;
    this._actionHandler = null;
    this._executableHandler = false;
    this._executableFile = null; // custom name for executable
    this._executableDir = null; // custom search directory for subcommands
    this._defaultCommandName = null;
    this._exitCallback = null;
    this._aliases = [];
    this._combineFlagAndOptionalValue = true;
    this._description = '';
    this._summary = '';
    this._argsDescription = undefined; // legacy
    this._enablePositionalOptions = false;
    this._passThroughOptions = false;
    this._lifeCycleHooks = {}; // a hash of arrays
    /** @type {(boolean | string)} */
    this._showHelpAfterError = false;
    this._showSuggestionAfterError = true;

    // see .configureOutput() for docs
    this._outputConfiguration = {
      writeOut: (str) => process$2.stdout.write(str),
      writeErr: (str) => process$2.stderr.write(str),
      getOutHelpWidth: () =>
        process$2.stdout.isTTY ? process$2.stdout.columns : undefined,
      getErrHelpWidth: () =>
        process$2.stderr.isTTY ? process$2.stderr.columns : undefined,
      outputError: (str, write) => write(str),
    };

    this._hidden = false;
    /** @type {(Option | null | undefined)} */
    this._helpOption = undefined; // Lazy created on demand. May be null if help option is disabled.
    this._addImplicitHelpCommand = undefined; // undecided whether true or false yet, not inherited
    /** @type {Command} */
    this._helpCommand = undefined; // lazy initialised, inherited
    this._helpConfiguration = {};
  }

  /**
   * Copy settings that are useful to have in common across root command and subcommands.
   *
   * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
   *
   * @param {Command} sourceCommand
   * @return {Command} `this` command for chaining
   */
  copyInheritedSettings(sourceCommand) {
    this._outputConfiguration = sourceCommand._outputConfiguration;
    this._helpOption = sourceCommand._helpOption;
    this._helpCommand = sourceCommand._helpCommand;
    this._helpConfiguration = sourceCommand._helpConfiguration;
    this._exitCallback = sourceCommand._exitCallback;
    this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
    this._combineFlagAndOptionalValue =
      sourceCommand._combineFlagAndOptionalValue;
    this._allowExcessArguments = sourceCommand._allowExcessArguments;
    this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
    this._showHelpAfterError = sourceCommand._showHelpAfterError;
    this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;

    return this;
  }

  /**
   * @returns {Command[]}
   * @private
   */

  _getCommandAndAncestors() {
    const result = [];
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    for (let command = this; command; command = command.parent) {
      result.push(command);
    }
    return result;
  }

  /**
   * Define a command.
   *
   * There are two styles of command: pay attention to where to put the description.
   *
   * @example
   * // Command implemented using action handler (description is supplied separately to `.command`)
   * program
   *   .command('clone <source> [destination]')
   *   .description('clone a repository into a newly created directory')
   *   .action((source, destination) => {
   *     console.log('clone command called');
   *   });
   *
   * // Command implemented using separate executable file (description is second parameter to `.command`)
   * program
   *   .command('start <service>', 'start named service')
   *   .command('stop [service]', 'stop named service, or all if no name supplied');
   *
   * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
   * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
   * @param {object} [execOpts] - configuration options (for executable)
   * @return {Command} returns new command for action handler, or `this` for executable command
   */

  command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
    let desc = actionOptsOrExecDesc;
    let opts = execOpts;
    if (typeof desc === 'object' && desc !== null) {
      opts = desc;
      desc = null;
    }
    opts = opts || {};
    const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);

    const cmd = this.createCommand(name);
    if (desc) {
      cmd.description(desc);
      cmd._executableHandler = true;
    }
    if (opts.isDefault) this._defaultCommandName = cmd._name;
    cmd._hidden = !!(opts.noHelp || opts.hidden); // noHelp is deprecated old name for hidden
    cmd._executableFile = opts.executableFile || null; // Custom name for executable file, set missing to null to match constructor
    if (args) cmd.arguments(args);
    this._registerCommand(cmd);
    cmd.parent = this;
    cmd.copyInheritedSettings(this);

    if (desc) return this;
    return cmd;
  }

  /**
   * Factory routine to create a new unattached command.
   *
   * See .command() for creating an attached subcommand, which uses this routine to
   * create the command. You can override createCommand to customise subcommands.
   *
   * @param {string} [name]
   * @return {Command} new command
   */

  createCommand(name) {
    return new Command(name);
  }

  /**
   * You can customise the help with a subclass of Help by overriding createHelp,
   * or by overriding Help properties using configureHelp().
   *
   * @return {Help}
   */

  createHelp() {
    return Object.assign(new Help$2(), this.configureHelp());
  }

  /**
   * You can customise the help by overriding Help properties using configureHelp(),
   * or with a subclass of Help by overriding createHelp().
   *
   * @param {object} [configuration] - configuration options
   * @return {(Command | object)} `this` command for chaining, or stored configuration
   */

  configureHelp(configuration) {
    if (configuration === undefined) return this._helpConfiguration;

    this._helpConfiguration = configuration;
    return this;
  }

  /**
   * The default output goes to stdout and stderr. You can customise this for special
   * applications. You can also customise the display of errors by overriding outputError.
   *
   * The configuration properties are all functions:
   *
   *     // functions to change where being written, stdout and stderr
   *     writeOut(str)
   *     writeErr(str)
   *     // matching functions to specify width for wrapping help
   *     getOutHelpWidth()
   *     getErrHelpWidth()
   *     // functions based on what is being written out
   *     outputError(str, write) // used for displaying errors, and not used for displaying help
   *
   * @param {object} [configuration] - configuration options
   * @return {(Command | object)} `this` command for chaining, or stored configuration
   */

  configureOutput(configuration) {
    if (configuration === undefined) return this._outputConfiguration;

    Object.assign(this._outputConfiguration, configuration);
    return this;
  }

  /**
   * Display the help or a custom message after an error occurs.
   *
   * @param {(boolean|string)} [displayHelp]
   * @return {Command} `this` command for chaining
   */
  showHelpAfterError(displayHelp = true) {
    if (typeof displayHelp !== 'string') displayHelp = !!displayHelp;
    this._showHelpAfterError = displayHelp;
    return this;
  }

  /**
   * Display suggestion of similar commands for unknown commands, or options for unknown options.
   *
   * @param {boolean} [displaySuggestion]
   * @return {Command} `this` command for chaining
   */
  showSuggestionAfterError(displaySuggestion = true) {
    this._showSuggestionAfterError = !!displaySuggestion;
    return this;
  }

  /**
   * Add a prepared subcommand.
   *
   * See .command() for creating an attached subcommand which inherits settings from its parent.
   *
   * @param {Command} cmd - new subcommand
   * @param {object} [opts] - configuration options
   * @return {Command} `this` command for chaining
   */

  addCommand(cmd, opts) {
    if (!cmd._name) {
      throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
    }

    opts = opts || {};
    if (opts.isDefault) this._defaultCommandName = cmd._name;
    if (opts.noHelp || opts.hidden) cmd._hidden = true; // modifying passed command due to existing implementation

    this._registerCommand(cmd);
    cmd.parent = this;
    cmd._checkForBrokenPassThrough();

    return this;
  }

  /**
   * Factory routine to create a new unattached argument.
   *
   * See .argument() for creating an attached argument, which uses this routine to
   * create the argument. You can override createArgument to return a custom argument.
   *
   * @param {string} name
   * @param {string} [description]
   * @return {Argument} new argument
   */

  createArgument(name, description) {
    return new Argument$2(name, description);
  }

  /**
   * Define argument syntax for command.
   *
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @example
   * program.argument('<input-file>');
   * program.argument('[output-file]');
   *
   * @param {string} name
   * @param {string} [description]
   * @param {(Function|*)} [fn] - custom argument processing function
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */
  argument(name, description, fn, defaultValue) {
    const argument = this.createArgument(name, description);
    if (typeof fn === 'function') {
      argument.default(defaultValue).argParser(fn);
    } else {
      argument.default(fn);
    }
    this.addArgument(argument);
    return this;
  }

  /**
   * Define argument syntax for command, adding multiple at once (without descriptions).
   *
   * See also .argument().
   *
   * @example
   * program.arguments('<cmd> [env]');
   *
   * @param {string} names
   * @return {Command} `this` command for chaining
   */

  arguments(names) {
    names
      .trim()
      .split(/ +/)
      .forEach((detail) => {
        this.argument(detail);
      });
    return this;
  }

  /**
   * Define argument syntax for command, adding a prepared argument.
   *
   * @param {Argument} argument
   * @return {Command} `this` command for chaining
   */
  addArgument(argument) {
    const previousArgument = this.registeredArguments.slice(-1)[0];
    if (previousArgument && previousArgument.variadic) {
      throw new Error(
        `only the last argument can be variadic '${previousArgument.name()}'`,
      );
    }
    if (
      argument.required &&
      argument.defaultValue !== undefined &&
      argument.parseArg === undefined
    ) {
      throw new Error(
        `a default value for a required argument is never used: '${argument.name()}'`,
      );
    }
    this.registeredArguments.push(argument);
    return this;
  }

  /**
   * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
   *
   * @example
   *    program.helpCommand('help [cmd]');
   *    program.helpCommand('help [cmd]', 'show help');
   *    program.helpCommand(false); // suppress default help command
   *    program.helpCommand(true); // add help command even if no subcommands
   *
   * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
   * @param {string} [description] - custom description
   * @return {Command} `this` command for chaining
   */

  helpCommand(enableOrNameAndArgs, description) {
    if (typeof enableOrNameAndArgs === 'boolean') {
      this._addImplicitHelpCommand = enableOrNameAndArgs;
      return this;
    }

    enableOrNameAndArgs = enableOrNameAndArgs ?? 'help [command]';
    const [, helpName, helpArgs] = enableOrNameAndArgs.match(/([^ ]+) *(.*)/);
    const helpDescription = description ?? 'display help for command';

    const helpCommand = this.createCommand(helpName);
    helpCommand.helpOption(false);
    if (helpArgs) helpCommand.arguments(helpArgs);
    if (helpDescription) helpCommand.description(helpDescription);

    this._addImplicitHelpCommand = true;
    this._helpCommand = helpCommand;

    return this;
  }

  /**
   * Add prepared custom help command.
   *
   * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
   * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
   * @return {Command} `this` command for chaining
   */
  addHelpCommand(helpCommand, deprecatedDescription) {
    // If not passed an object, call through to helpCommand for backwards compatibility,
    // as addHelpCommand was originally used like helpCommand is now.
    if (typeof helpCommand !== 'object') {
      this.helpCommand(helpCommand, deprecatedDescription);
      return this;
    }

    this._addImplicitHelpCommand = true;
    this._helpCommand = helpCommand;
    return this;
  }

  /**
   * Lazy create help command.
   *
   * @return {(Command|null)}
   * @package
   */
  _getHelpCommand() {
    const hasImplicitHelpCommand =
      this._addImplicitHelpCommand ??
      (this.commands.length &&
        !this._actionHandler &&
        !this._findCommand('help'));

    if (hasImplicitHelpCommand) {
      if (this._helpCommand === undefined) {
        this.helpCommand(undefined, undefined); // use default name and description
      }
      return this._helpCommand;
    }
    return null;
  }

  /**
   * Add hook for life cycle event.
   *
   * @param {string} event
   * @param {Function} listener
   * @return {Command} `this` command for chaining
   */

  hook(event, listener) {
    const allowedValues = ['preSubcommand', 'preAction', 'postAction'];
    if (!allowedValues.includes(event)) {
      throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
    }
    if (this._lifeCycleHooks[event]) {
      this._lifeCycleHooks[event].push(listener);
    } else {
      this._lifeCycleHooks[event] = [listener];
    }
    return this;
  }

  /**
   * Register callback to use as replacement for calling process.exit.
   *
   * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
   * @return {Command} `this` command for chaining
   */

  exitOverride(fn) {
    if (fn) {
      this._exitCallback = fn;
    } else {
      this._exitCallback = (err) => {
        if (err.code !== 'commander.executeSubCommandAsync') {
          throw err;
        }
      };
    }
    return this;
  }

  /**
   * Call process.exit, and _exitCallback if defined.
   *
   * @param {number} exitCode exit code for using with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   * @return never
   * @private
   */

  _exit(exitCode, code, message) {
    if (this._exitCallback) {
      this._exitCallback(new CommanderError$2(exitCode, code, message));
      // Expecting this line is not reached.
    }
    process$2.exit(exitCode);
  }

  /**
   * Register callback `fn` for the command.
   *
   * @example
   * program
   *   .command('serve')
   *   .description('start service')
   *   .action(function() {
   *      // do work here
   *   });
   *
   * @param {Function} fn
   * @return {Command} `this` command for chaining
   */

  action(fn) {
    const listener = (args) => {
      // The .action callback takes an extra parameter which is the command or options.
      const expectedArgsCount = this.registeredArguments.length;
      const actionArgs = args.slice(0, expectedArgsCount);
      if (this._storeOptionsAsProperties) {
        actionArgs[expectedArgsCount] = this; // backwards compatible "options"
      } else {
        actionArgs[expectedArgsCount] = this.opts();
      }
      actionArgs.push(this);

      return fn.apply(this, actionArgs);
    };
    this._actionHandler = listener;
    return this;
  }

  /**
   * Factory routine to create a new unattached option.
   *
   * See .option() for creating an attached option, which uses this routine to
   * create the option. You can override createOption to return a custom option.
   *
   * @param {string} flags
   * @param {string} [description]
   * @return {Option} new option
   */

  createOption(flags, description) {
    return new Option$2(flags, description);
  }

  /**
   * Wrap parseArgs to catch 'commander.invalidArgument'.
   *
   * @param {(Option | Argument)} target
   * @param {string} value
   * @param {*} previous
   * @param {string} invalidArgumentMessage
   * @private
   */

  _callParseArg(target, value, previous, invalidArgumentMessage) {
    try {
      return target.parseArg(value, previous);
    } catch (err) {
      if (err.code === 'commander.invalidArgument') {
        const message = `${invalidArgumentMessage} ${err.message}`;
        this.error(message, { exitCode: err.exitCode, code: err.code });
      }
      throw err;
    }
  }

  /**
   * Check for option flag conflicts.
   * Register option if no conflicts found, or throw on conflict.
   *
   * @param {Option} option
   * @private
   */

  _registerOption(option) {
    const matchingOption =
      (option.short && this._findOption(option.short)) ||
      (option.long && this._findOption(option.long));
    if (matchingOption) {
      const matchingFlag =
        option.long && this._findOption(option.long)
          ? option.long
          : option.short;
      throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
    }

    this.options.push(option);
  }

  /**
   * Check for command name and alias conflicts with existing commands.
   * Register command if no conflicts found, or throw on conflict.
   *
   * @param {Command} command
   * @private
   */

  _registerCommand(command) {
    const knownBy = (cmd) => {
      return [cmd.name()].concat(cmd.aliases());
    };

    const alreadyUsed = knownBy(command).find((name) =>
      this._findCommand(name),
    );
    if (alreadyUsed) {
      const existingCmd = knownBy(this._findCommand(alreadyUsed)).join('|');
      const newCmd = knownBy(command).join('|');
      throw new Error(
        `cannot add command '${newCmd}' as already have command '${existingCmd}'`,
      );
    }

    this.commands.push(command);
  }

  /**
   * Add an option.
   *
   * @param {Option} option
   * @return {Command} `this` command for chaining
   */
  addOption(option) {
    this._registerOption(option);

    const oname = option.name();
    const name = option.attributeName();

    // store default value
    if (option.negate) {
      // --no-foo is special and defaults foo to true, unless a --foo option is already defined
      const positiveLongFlag = option.long.replace(/^--no-/, '--');
      if (!this._findOption(positiveLongFlag)) {
        this.setOptionValueWithSource(
          name,
          option.defaultValue === undefined ? true : option.defaultValue,
          'default',
        );
      }
    } else if (option.defaultValue !== undefined) {
      this.setOptionValueWithSource(name, option.defaultValue, 'default');
    }

    // handler for cli and env supplied values
    const handleOptionValue = (val, invalidValueMessage, valueSource) => {
      // val is null for optional option used without an optional-argument.
      // val is undefined for boolean and negated option.
      if (val == null && option.presetArg !== undefined) {
        val = option.presetArg;
      }

      // custom processing
      const oldValue = this.getOptionValue(name);
      if (val !== null && option.parseArg) {
        val = this._callParseArg(option, val, oldValue, invalidValueMessage);
      } else if (val !== null && option.variadic) {
        val = option._concatValue(val, oldValue);
      }

      // Fill-in appropriate missing values. Long winded but easy to follow.
      if (val == null) {
        if (option.negate) {
          val = false;
        } else if (option.isBoolean() || option.optional) {
          val = true;
        } else {
          val = ''; // not normal, parseArg might have failed or be a mock function for testing
        }
      }
      this.setOptionValueWithSource(name, val, valueSource);
    };

    this.on('option:' + oname, (val) => {
      const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
      handleOptionValue(val, invalidValueMessage, 'cli');
    });

    if (option.envVar) {
      this.on('optionEnv:' + oname, (val) => {
        const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
        handleOptionValue(val, invalidValueMessage, 'env');
      });
    }

    return this;
  }

  /**
   * Internal implementation shared by .option() and .requiredOption()
   *
   * @return {Command} `this` command for chaining
   * @private
   */
  _optionEx(config, flags, description, fn, defaultValue) {
    if (typeof flags === 'object' && flags instanceof Option$2) {
      throw new Error(
        'To add an Option object use addOption() instead of option() or requiredOption()',
      );
    }
    const option = this.createOption(flags, description);
    option.makeOptionMandatory(!!config.mandatory);
    if (typeof fn === 'function') {
      option.default(defaultValue).argParser(fn);
    } else if (fn instanceof RegExp) {
      // deprecated
      const regex = fn;
      fn = (val, def) => {
        const m = regex.exec(val);
        return m ? m[0] : def;
      };
      option.default(defaultValue).argParser(fn);
    } else {
      option.default(fn);
    }

    return this.addOption(option);
  }

  /**
   * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
   *
   * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
   * option-argument is indicated by `<>` and an optional option-argument by `[]`.
   *
   * See the README for more details, and see also addOption() and requiredOption().
   *
   * @example
   * program
   *     .option('-p, --pepper', 'add pepper')
   *     .option('-p, --pizza-type <TYPE>', 'type of pizza') // required option-argument
   *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
   *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
   *
   * @param {string} flags
   * @param {string} [description]
   * @param {(Function|*)} [parseArg] - custom option processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */

  option(flags, description, parseArg, defaultValue) {
    return this._optionEx({}, flags, description, parseArg, defaultValue);
  }

  /**
   * Add a required option which must have a value after parsing. This usually means
   * the option must be specified on the command line. (Otherwise the same as .option().)
   *
   * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
   *
   * @param {string} flags
   * @param {string} [description]
   * @param {(Function|*)} [parseArg] - custom option processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */

  requiredOption(flags, description, parseArg, defaultValue) {
    return this._optionEx(
      { mandatory: true },
      flags,
      description,
      parseArg,
      defaultValue,
    );
  }

  /**
   * Alter parsing of short flags with optional values.
   *
   * @example
   * // for `.option('-f,--flag [value]'):
   * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
   * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
   *
   * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
   * @return {Command} `this` command for chaining
   */
  combineFlagAndOptionalValue(combine = true) {
    this._combineFlagAndOptionalValue = !!combine;
    return this;
  }

  /**
   * Allow unknown options on the command line.
   *
   * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
   * @return {Command} `this` command for chaining
   */
  allowUnknownOption(allowUnknown = true) {
    this._allowUnknownOption = !!allowUnknown;
    return this;
  }

  /**
   * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
   *
   * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
   * @return {Command} `this` command for chaining
   */
  allowExcessArguments(allowExcess = true) {
    this._allowExcessArguments = !!allowExcess;
    return this;
  }

  /**
   * Enable positional options. Positional means global options are specified before subcommands which lets
   * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
   * The default behaviour is non-positional and global options may appear anywhere on the command line.
   *
   * @param {boolean} [positional]
   * @return {Command} `this` command for chaining
   */
  enablePositionalOptions(positional = true) {
    this._enablePositionalOptions = !!positional;
    return this;
  }

  /**
   * Pass through options that come after command-arguments rather than treat them as command-options,
   * so actual command-options come before command-arguments. Turning this on for a subcommand requires
   * positional options to have been enabled on the program (parent commands).
   * The default behaviour is non-positional and options may appear before or after command-arguments.
   *
   * @param {boolean} [passThrough] for unknown options.
   * @return {Command} `this` command for chaining
   */
  passThroughOptions(passThrough = true) {
    this._passThroughOptions = !!passThrough;
    this._checkForBrokenPassThrough();
    return this;
  }

  /**
   * @private
   */

  _checkForBrokenPassThrough() {
    if (
      this.parent &&
      this._passThroughOptions &&
      !this.parent._enablePositionalOptions
    ) {
      throw new Error(
        `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`,
      );
    }
  }

  /**
   * Whether to store option values as properties on command object,
   * or store separately (specify false). In both cases the option values can be accessed using .opts().
   *
   * @param {boolean} [storeAsProperties=true]
   * @return {Command} `this` command for chaining
   */

  storeOptionsAsProperties(storeAsProperties = true) {
    if (this.options.length) {
      throw new Error('call .storeOptionsAsProperties() before adding options');
    }
    if (Object.keys(this._optionValues).length) {
      throw new Error(
        'call .storeOptionsAsProperties() before setting option values',
      );
    }
    this._storeOptionsAsProperties = !!storeAsProperties;
    return this;
  }

  /**
   * Retrieve option value.
   *
   * @param {string} key
   * @return {object} value
   */

  getOptionValue(key) {
    if (this._storeOptionsAsProperties) {
      return this[key];
    }
    return this._optionValues[key];
  }

  /**
   * Store option value.
   *
   * @param {string} key
   * @param {object} value
   * @return {Command} `this` command for chaining
   */

  setOptionValue(key, value) {
    return this.setOptionValueWithSource(key, value, undefined);
  }

  /**
   * Store option value and where the value came from.
   *
   * @param {string} key
   * @param {object} value
   * @param {string} source - expected values are default/config/env/cli/implied
   * @return {Command} `this` command for chaining
   */

  setOptionValueWithSource(key, value, source) {
    if (this._storeOptionsAsProperties) {
      this[key] = value;
    } else {
      this._optionValues[key] = value;
    }
    this._optionValueSources[key] = source;
    return this;
  }

  /**
   * Get source of option value.
   * Expected values are default | config | env | cli | implied
   *
   * @param {string} key
   * @return {string}
   */

  getOptionValueSource(key) {
    return this._optionValueSources[key];
  }

  /**
   * Get source of option value. See also .optsWithGlobals().
   * Expected values are default | config | env | cli | implied
   *
   * @param {string} key
   * @return {string}
   */

  getOptionValueSourceWithGlobals(key) {
    // global overwrites local, like optsWithGlobals
    let source;
    this._getCommandAndAncestors().forEach((cmd) => {
      if (cmd.getOptionValueSource(key) !== undefined) {
        source = cmd.getOptionValueSource(key);
      }
    });
    return source;
  }

  /**
   * Get user arguments from implied or explicit arguments.
   * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
   *
   * @private
   */

  _prepareUserArgs(argv, parseOptions) {
    if (argv !== undefined && !Array.isArray(argv)) {
      throw new Error('first parameter to parse must be array or undefined');
    }
    parseOptions = parseOptions || {};

    // auto-detect argument conventions if nothing supplied
    if (argv === undefined && parseOptions.from === undefined) {
      if (process$2.versions?.electron) {
        parseOptions.from = 'electron';
      }
      // check node specific options for scenarios where user CLI args follow executable without scriptname
      const execArgv = process$2.execArgv ?? [];
      if (
        execArgv.includes('-e') ||
        execArgv.includes('--eval') ||
        execArgv.includes('-p') ||
        execArgv.includes('--print')
      ) {
        parseOptions.from = 'eval'; // internal usage, not documented
      }
    }

    // default to using process.argv
    if (argv === undefined) {
      argv = process$2.argv;
    }
    this.rawArgs = argv.slice();

    // extract the user args and scriptPath
    let userArgs;
    switch (parseOptions.from) {
      case undefined:
      case 'node':
        this._scriptPath = argv[1];
        userArgs = argv.slice(2);
        break;
      case 'electron':
        // @ts-ignore: because defaultApp is an unknown property
        if (process$2.defaultApp) {
          this._scriptPath = argv[1];
          userArgs = argv.slice(2);
        } else {
          userArgs = argv.slice(1);
        }
        break;
      case 'user':
        userArgs = argv.slice(0);
        break;
      case 'eval':
        userArgs = argv.slice(1);
        break;
      default:
        throw new Error(
          `unexpected parse option { from: '${parseOptions.from}' }`,
        );
    }

    // Find default name for program from arguments.
    if (!this._name && this._scriptPath)
      this.nameFromFilename(this._scriptPath);
    this._name = this._name || 'program';

    return userArgs;
  }

  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * Use parseAsync instead of parse if any of your action handlers are async.
   *
   * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
   *
   * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
   * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
   * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
   * - `'user'`: just user arguments
   *
   * @example
   * program.parse(); // parse process.argv and auto-detect electron and special node flags
   * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
   * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv] - optional, defaults to process.argv
   * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
   * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
   * @return {Command} `this` command for chaining
   */

  parse(argv, parseOptions) {
    const userArgs = this._prepareUserArgs(argv, parseOptions);
    this._parseCommand([], userArgs);

    return this;
  }

  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
   *
   * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
   * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
   * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
   * - `'user'`: just user arguments
   *
   * @example
   * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
   * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
   * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv]
   * @param {object} [parseOptions]
   * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
   * @return {Promise}
   */

  async parseAsync(argv, parseOptions) {
    const userArgs = this._prepareUserArgs(argv, parseOptions);
    await this._parseCommand([], userArgs);

    return this;
  }

  /**
   * Execute a sub-command executable.
   *
   * @private
   */

  _executeSubCommand(subcommand, args) {
    args = args.slice();
    let launchWithNode = false; // Use node for source targets so do not need to get permissions correct, and on Windows.
    const sourceExt = ['.js', '.ts', '.tsx', '.mjs', '.cjs'];

    function findFile(baseDir, baseName) {
      // Look for specified file
      const localBin = path$b.resolve(baseDir, baseName);
      if (fs$b.existsSync(localBin)) return localBin;

      // Stop looking if candidate already has an expected extension.
      if (sourceExt.includes(path$b.extname(baseName))) return undefined;

      // Try all the extensions.
      const foundExt = sourceExt.find((ext) =>
        fs$b.existsSync(`${localBin}${ext}`),
      );
      if (foundExt) return `${localBin}${foundExt}`;

      return undefined;
    }

    // Not checking for help first. Unlikely to have mandatory and executable, and can't robustly test for help flags in external command.
    this._checkForMissingMandatoryOptions();
    this._checkForConflictingOptions();

    // executableFile and executableDir might be full path, or just a name
    let executableFile =
      subcommand._executableFile || `${this._name}-${subcommand._name}`;
    let executableDir = this._executableDir || '';
    if (this._scriptPath) {
      let resolvedScriptPath; // resolve possible symlink for installed npm binary
      try {
        resolvedScriptPath = fs$b.realpathSync(this._scriptPath);
      } catch (err) {
        resolvedScriptPath = this._scriptPath;
      }
      executableDir = path$b.resolve(
        path$b.dirname(resolvedScriptPath),
        executableDir,
      );
    }

    // Look for a local file in preference to a command in PATH.
    if (executableDir) {
      let localFile = findFile(executableDir, executableFile);

      // Legacy search using prefix of script name instead of command name
      if (!localFile && !subcommand._executableFile && this._scriptPath) {
        const legacyName = path$b.basename(
          this._scriptPath,
          path$b.extname(this._scriptPath),
        );
        if (legacyName !== this._name) {
          localFile = findFile(
            executableDir,
            `${legacyName}-${subcommand._name}`,
          );
        }
      }
      executableFile = localFile || executableFile;
    }

    launchWithNode = sourceExt.includes(path$b.extname(executableFile));

    let proc;
    if (process$2.platform !== 'win32') {
      if (launchWithNode) {
        args.unshift(executableFile);
        // add executable arguments to spawn
        args = incrementNodeInspectorPort(process$2.execArgv).concat(args);

        proc = childProcess.spawn(process$2.argv[0], args, { stdio: 'inherit' });
      } else {
        proc = childProcess.spawn(executableFile, args, { stdio: 'inherit' });
      }
    } else {
      args.unshift(executableFile);
      // add executable arguments to spawn
      args = incrementNodeInspectorPort(process$2.execArgv).concat(args);
      proc = childProcess.spawn(process$2.execPath, args, { stdio: 'inherit' });
    }

    if (!proc.killed) {
      // testing mainly to avoid leak warnings during unit tests with mocked spawn
      const signals = ['SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGINT', 'SIGHUP'];
      signals.forEach((signal) => {
        process$2.on(signal, () => {
          if (proc.killed === false && proc.exitCode === null) {
            // @ts-ignore because signals not typed to known strings
            proc.kill(signal);
          }
        });
      });
    }

    // By default terminate process when spawned process terminates.
    const exitCallback = this._exitCallback;
    proc.on('close', (code) => {
      code = code ?? 1; // code is null if spawned process terminated due to a signal
      if (!exitCallback) {
        process$2.exit(code);
      } else {
        exitCallback(
          new CommanderError$2(
            code,
            'commander.executeSubCommandAsync',
            '(close)',
          ),
        );
      }
    });
    proc.on('error', (err) => {
      // @ts-ignore: because err.code is an unknown property
      if (err.code === 'ENOENT') {
        const executableDirMessage = executableDir
          ? `searched for local subcommand relative to directory '${executableDir}'`
          : 'no directory for search for local subcommand, use .executableDir() to supply a custom directory';
        const executableMissing = `'${executableFile}' does not exist
 - if '${subcommand._name}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
        throw new Error(executableMissing);
        // @ts-ignore: because err.code is an unknown property
      } else if (err.code === 'EACCES') {
        throw new Error(`'${executableFile}' not executable`);
      }
      if (!exitCallback) {
        process$2.exit(1);
      } else {
        const wrappedError = new CommanderError$2(
          1,
          'commander.executeSubCommandAsync',
          '(error)',
        );
        wrappedError.nestedError = err;
        exitCallback(wrappedError);
      }
    });

    // Store the reference to the child process
    this.runningCommand = proc;
  }

  /**
   * @private
   */

  _dispatchSubcommand(commandName, operands, unknown) {
    const subCommand = this._findCommand(commandName);
    if (!subCommand) this.help({ error: true });

    let promiseChain;
    promiseChain = this._chainOrCallSubCommandHook(
      promiseChain,
      subCommand,
      'preSubcommand',
    );
    promiseChain = this._chainOrCall(promiseChain, () => {
      if (subCommand._executableHandler) {
        this._executeSubCommand(subCommand, operands.concat(unknown));
      } else {
        return subCommand._parseCommand(operands, unknown);
      }
    });
    return promiseChain;
  }

  /**
   * Invoke help directly if possible, or dispatch if necessary.
   * e.g. help foo
   *
   * @private
   */

  _dispatchHelpCommand(subcommandName) {
    if (!subcommandName) {
      this.help();
    }
    const subCommand = this._findCommand(subcommandName);
    if (subCommand && !subCommand._executableHandler) {
      subCommand.help();
    }

    // Fallback to parsing the help flag to invoke the help.
    return this._dispatchSubcommand(
      subcommandName,
      [],
      [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? '--help'],
    );
  }

  /**
   * Check this.args against expected this.registeredArguments.
   *
   * @private
   */

  _checkNumberOfArguments() {
    // too few
    this.registeredArguments.forEach((arg, i) => {
      if (arg.required && this.args[i] == null) {
        this.missingArgument(arg.name());
      }
    });
    // too many
    if (
      this.registeredArguments.length > 0 &&
      this.registeredArguments[this.registeredArguments.length - 1].variadic
    ) {
      return;
    }
    if (this.args.length > this.registeredArguments.length) {
      this._excessArguments(this.args);
    }
  }

  /**
   * Process this.args using this.registeredArguments and save as this.processedArgs!
   *
   * @private
   */

  _processArguments() {
    const myParseArg = (argument, value, previous) => {
      // Extra processing for nice error message on parsing failure.
      let parsedValue = value;
      if (value !== null && argument.parseArg) {
        const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
        parsedValue = this._callParseArg(
          argument,
          value,
          previous,
          invalidValueMessage,
        );
      }
      return parsedValue;
    };

    this._checkNumberOfArguments();

    const processedArgs = [];
    this.registeredArguments.forEach((declaredArg, index) => {
      let value = declaredArg.defaultValue;
      if (declaredArg.variadic) {
        // Collect together remaining arguments for passing together as an array.
        if (index < this.args.length) {
          value = this.args.slice(index);
          if (declaredArg.parseArg) {
            value = value.reduce((processed, v) => {
              return myParseArg(declaredArg, v, processed);
            }, declaredArg.defaultValue);
          }
        } else if (value === undefined) {
          value = [];
        }
      } else if (index < this.args.length) {
        value = this.args[index];
        if (declaredArg.parseArg) {
          value = myParseArg(declaredArg, value, declaredArg.defaultValue);
        }
      }
      processedArgs[index] = value;
    });
    this.processedArgs = processedArgs;
  }

  /**
   * Once we have a promise we chain, but call synchronously until then.
   *
   * @param {(Promise|undefined)} promise
   * @param {Function} fn
   * @return {(Promise|undefined)}
   * @private
   */

  _chainOrCall(promise, fn) {
    // thenable
    if (promise && promise.then && typeof promise.then === 'function') {
      // already have a promise, chain callback
      return promise.then(() => fn());
    }
    // callback might return a promise
    return fn();
  }

  /**
   *
   * @param {(Promise|undefined)} promise
   * @param {string} event
   * @return {(Promise|undefined)}
   * @private
   */

  _chainOrCallHooks(promise, event) {
    let result = promise;
    const hooks = [];
    this._getCommandAndAncestors()
      .reverse()
      .filter((cmd) => cmd._lifeCycleHooks[event] !== undefined)
      .forEach((hookedCommand) => {
        hookedCommand._lifeCycleHooks[event].forEach((callback) => {
          hooks.push({ hookedCommand, callback });
        });
      });
    if (event === 'postAction') {
      hooks.reverse();
    }

    hooks.forEach((hookDetail) => {
      result = this._chainOrCall(result, () => {
        return hookDetail.callback(hookDetail.hookedCommand, this);
      });
    });
    return result;
  }

  /**
   *
   * @param {(Promise|undefined)} promise
   * @param {Command} subCommand
   * @param {string} event
   * @return {(Promise|undefined)}
   * @private
   */

  _chainOrCallSubCommandHook(promise, subCommand, event) {
    let result = promise;
    if (this._lifeCycleHooks[event] !== undefined) {
      this._lifeCycleHooks[event].forEach((hook) => {
        result = this._chainOrCall(result, () => {
          return hook(this, subCommand);
        });
      });
    }
    return result;
  }

  /**
   * Process arguments in context of this command.
   * Returns action result, in case it is a promise.
   *
   * @private
   */

  _parseCommand(operands, unknown) {
    const parsed = this.parseOptions(unknown);
    this._parseOptionsEnv(); // after cli, so parseArg not called on both cli and env
    this._parseOptionsImplied();
    operands = operands.concat(parsed.operands);
    unknown = parsed.unknown;
    this.args = operands.concat(unknown);

    if (operands && this._findCommand(operands[0])) {
      return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
    }
    if (
      this._getHelpCommand() &&
      operands[0] === this._getHelpCommand().name()
    ) {
      return this._dispatchHelpCommand(operands[1]);
    }
    if (this._defaultCommandName) {
      this._outputHelpIfRequested(unknown); // Run the help for default command from parent rather than passing to default command
      return this._dispatchSubcommand(
        this._defaultCommandName,
        operands,
        unknown,
      );
    }
    if (
      this.commands.length &&
      this.args.length === 0 &&
      !this._actionHandler &&
      !this._defaultCommandName
    ) {
      // probably missing subcommand and no handler, user needs help (and exit)
      this.help({ error: true });
    }

    this._outputHelpIfRequested(parsed.unknown);
    this._checkForMissingMandatoryOptions();
    this._checkForConflictingOptions();

    // We do not always call this check to avoid masking a "better" error, like unknown command.
    const checkForUnknownOptions = () => {
      if (parsed.unknown.length > 0) {
        this.unknownOption(parsed.unknown[0]);
      }
    };

    const commandEvent = `command:${this.name()}`;
    if (this._actionHandler) {
      checkForUnknownOptions();
      this._processArguments();

      let promiseChain;
      promiseChain = this._chainOrCallHooks(promiseChain, 'preAction');
      promiseChain = this._chainOrCall(promiseChain, () =>
        this._actionHandler(this.processedArgs),
      );
      if (this.parent) {
        promiseChain = this._chainOrCall(promiseChain, () => {
          this.parent.emit(commandEvent, operands, unknown); // legacy
        });
      }
      promiseChain = this._chainOrCallHooks(promiseChain, 'postAction');
      return promiseChain;
    }
    if (this.parent && this.parent.listenerCount(commandEvent)) {
      checkForUnknownOptions();
      this._processArguments();
      this.parent.emit(commandEvent, operands, unknown); // legacy
    } else if (operands.length) {
      if (this._findCommand('*')) {
        // legacy default command
        return this._dispatchSubcommand('*', operands, unknown);
      }
      if (this.listenerCount('command:*')) {
        // skip option check, emit event for possible misspelling suggestion
        this.emit('command:*', operands, unknown);
      } else if (this.commands.length) {
        this.unknownCommand();
      } else {
        checkForUnknownOptions();
        this._processArguments();
      }
    } else if (this.commands.length) {
      checkForUnknownOptions();
      // This command has subcommands and nothing hooked up at this level, so display help (and exit).
      this.help({ error: true });
    } else {
      checkForUnknownOptions();
      this._processArguments();
      // fall through for caller to handle after calling .parse()
    }
  }

  /**
   * Find matching command.
   *
   * @private
   * @return {Command | undefined}
   */
  _findCommand(name) {
    if (!name) return undefined;
    return this.commands.find(
      (cmd) => cmd._name === name || cmd._aliases.includes(name),
    );
  }

  /**
   * Return an option matching `arg` if any.
   *
   * @param {string} arg
   * @return {Option}
   * @package
   */

  _findOption(arg) {
    return this.options.find((option) => option.is(arg));
  }

  /**
   * Display an error message if a mandatory option does not have a value.
   * Called after checking for help flags in leaf subcommand.
   *
   * @private
   */

  _checkForMissingMandatoryOptions() {
    // Walk up hierarchy so can call in subcommand after checking for displaying help.
    this._getCommandAndAncestors().forEach((cmd) => {
      cmd.options.forEach((anOption) => {
        if (
          anOption.mandatory &&
          cmd.getOptionValue(anOption.attributeName()) === undefined
        ) {
          cmd.missingMandatoryOptionValue(anOption);
        }
      });
    });
  }

  /**
   * Display an error message if conflicting options are used together in this.
   *
   * @private
   */
  _checkForConflictingLocalOptions() {
    const definedNonDefaultOptions = this.options.filter((option) => {
      const optionKey = option.attributeName();
      if (this.getOptionValue(optionKey) === undefined) {
        return false;
      }
      return this.getOptionValueSource(optionKey) !== 'default';
    });

    const optionsWithConflicting = definedNonDefaultOptions.filter(
      (option) => option.conflictsWith.length > 0,
    );

    optionsWithConflicting.forEach((option) => {
      const conflictingAndDefined = definedNonDefaultOptions.find((defined) =>
        option.conflictsWith.includes(defined.attributeName()),
      );
      if (conflictingAndDefined) {
        this._conflictingOption(option, conflictingAndDefined);
      }
    });
  }

  /**
   * Display an error message if conflicting options are used together.
   * Called after checking for help flags in leaf subcommand.
   *
   * @private
   */
  _checkForConflictingOptions() {
    // Walk up hierarchy so can call in subcommand after checking for displaying help.
    this._getCommandAndAncestors().forEach((cmd) => {
      cmd._checkForConflictingLocalOptions();
    });
  }

  /**
   * Parse options from `argv` removing known options,
   * and return argv split into operands and unknown arguments.
   *
   * Examples:
   *
   *     argv => operands, unknown
   *     --known kkk op => [op], []
   *     op --known kkk => [op], []
   *     sub --unknown uuu op => [sub], [--unknown uuu op]
   *     sub -- --unknown uuu op => [sub --unknown uuu op], []
   *
   * @param {string[]} argv
   * @return {{operands: string[], unknown: string[]}}
   */

  parseOptions(argv) {
    const operands = []; // operands, not options or values
    const unknown = []; // first unknown option and remaining unknown args
    let dest = operands;
    const args = argv.slice();

    function maybeOption(arg) {
      return arg.length > 1 && arg[0] === '-';
    }

    // parse options
    let activeVariadicOption = null;
    while (args.length) {
      const arg = args.shift();

      // literal
      if (arg === '--') {
        if (dest === unknown) dest.push(arg);
        dest.push(...args);
        break;
      }

      if (activeVariadicOption && !maybeOption(arg)) {
        this.emit(`option:${activeVariadicOption.name()}`, arg);
        continue;
      }
      activeVariadicOption = null;

      if (maybeOption(arg)) {
        const option = this._findOption(arg);
        // recognised option, call listener to assign value with possible custom processing
        if (option) {
          if (option.required) {
            const value = args.shift();
            if (value === undefined) this.optionMissingArgument(option);
            this.emit(`option:${option.name()}`, value);
          } else if (option.optional) {
            let value = null;
            // historical behaviour is optional value is following arg unless an option
            if (args.length > 0 && !maybeOption(args[0])) {
              value = args.shift();
            }
            this.emit(`option:${option.name()}`, value);
          } else {
            // boolean flag
            this.emit(`option:${option.name()}`);
          }
          activeVariadicOption = option.variadic ? option : null;
          continue;
        }
      }

      // Look for combo options following single dash, eat first one if known.
      if (arg.length > 2 && arg[0] === '-' && arg[1] !== '-') {
        const option = this._findOption(`-${arg[1]}`);
        if (option) {
          if (
            option.required ||
            (option.optional && this._combineFlagAndOptionalValue)
          ) {
            // option with value following in same argument
            this.emit(`option:${option.name()}`, arg.slice(2));
          } else {
            // boolean option, emit and put back remainder of arg for further processing
            this.emit(`option:${option.name()}`);
            args.unshift(`-${arg.slice(2)}`);
          }
          continue;
        }
      }

      // Look for known long flag with value, like --foo=bar
      if (/^--[^=]+=/.test(arg)) {
        const index = arg.indexOf('=');
        const option = this._findOption(arg.slice(0, index));
        if (option && (option.required || option.optional)) {
          this.emit(`option:${option.name()}`, arg.slice(index + 1));
          continue;
        }
      }

      // Not a recognised option by this command.
      // Might be a command-argument, or subcommand option, or unknown option, or help command or option.

      // An unknown option means further arguments also classified as unknown so can be reprocessed by subcommands.
      if (maybeOption(arg)) {
        dest = unknown;
      }

      // If using positionalOptions, stop processing our options at subcommand.
      if (
        (this._enablePositionalOptions || this._passThroughOptions) &&
        operands.length === 0 &&
        unknown.length === 0
      ) {
        if (this._findCommand(arg)) {
          operands.push(arg);
          if (args.length > 0) unknown.push(...args);
          break;
        } else if (
          this._getHelpCommand() &&
          arg === this._getHelpCommand().name()
        ) {
          operands.push(arg);
          if (args.length > 0) operands.push(...args);
          break;
        } else if (this._defaultCommandName) {
          unknown.push(arg);
          if (args.length > 0) unknown.push(...args);
          break;
        }
      }

      // If using passThroughOptions, stop processing options at first command-argument.
      if (this._passThroughOptions) {
        dest.push(arg);
        if (args.length > 0) dest.push(...args);
        break;
      }

      // add arg
      dest.push(arg);
    }

    return { operands, unknown };
  }

  /**
   * Return an object containing local option values as key-value pairs.
   *
   * @return {object}
   */
  opts() {
    if (this._storeOptionsAsProperties) {
      // Preserve original behaviour so backwards compatible when still using properties
      const result = {};
      const len = this.options.length;

      for (let i = 0; i < len; i++) {
        const key = this.options[i].attributeName();
        result[key] =
          key === this._versionOptionName ? this._version : this[key];
      }
      return result;
    }

    return this._optionValues;
  }

  /**
   * Return an object containing merged local and global option values as key-value pairs.
   *
   * @return {object}
   */
  optsWithGlobals() {
    // globals overwrite locals
    return this._getCommandAndAncestors().reduce(
      (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
      {},
    );
  }

  /**
   * Display error message and exit (or call exitOverride).
   *
   * @param {string} message
   * @param {object} [errorOptions]
   * @param {string} [errorOptions.code] - an id string representing the error
   * @param {number} [errorOptions.exitCode] - used with process.exit
   */
  error(message, errorOptions) {
    // output handling
    this._outputConfiguration.outputError(
      `${message}\n`,
      this._outputConfiguration.writeErr,
    );
    if (typeof this._showHelpAfterError === 'string') {
      this._outputConfiguration.writeErr(`${this._showHelpAfterError}\n`);
    } else if (this._showHelpAfterError) {
      this._outputConfiguration.writeErr('\n');
      this.outputHelp({ error: true });
    }

    // exit handling
    const config = errorOptions || {};
    const exitCode = config.exitCode || 1;
    const code = config.code || 'commander.error';
    this._exit(exitCode, code, message);
  }

  /**
   * Apply any option related environment variables, if option does
   * not have a value from cli or client code.
   *
   * @private
   */
  _parseOptionsEnv() {
    this.options.forEach((option) => {
      if (option.envVar && option.envVar in process$2.env) {
        const optionKey = option.attributeName();
        // Priority check. Do not overwrite cli or options from unknown source (client-code).
        if (
          this.getOptionValue(optionKey) === undefined ||
          ['default', 'config', 'env'].includes(
            this.getOptionValueSource(optionKey),
          )
        ) {
          if (option.required || option.optional) {
            // option can take a value
            // keep very simple, optional always takes value
            this.emit(`optionEnv:${option.name()}`, process$2.env[option.envVar]);
          } else {
            // boolean
            // keep very simple, only care that envVar defined and not the value
            this.emit(`optionEnv:${option.name()}`);
          }
        }
      }
    });
  }

  /**
   * Apply any implied option values, if option is undefined or default value.
   *
   * @private
   */
  _parseOptionsImplied() {
    const dualHelper = new DualOptions(this.options);
    const hasCustomOptionValue = (optionKey) => {
      return (
        this.getOptionValue(optionKey) !== undefined &&
        !['default', 'implied'].includes(this.getOptionValueSource(optionKey))
      );
    };
    this.options
      .filter(
        (option) =>
          option.implied !== undefined &&
          hasCustomOptionValue(option.attributeName()) &&
          dualHelper.valueFromOption(
            this.getOptionValue(option.attributeName()),
            option,
          ),
      )
      .forEach((option) => {
        Object.keys(option.implied)
          .filter((impliedKey) => !hasCustomOptionValue(impliedKey))
          .forEach((impliedKey) => {
            this.setOptionValueWithSource(
              impliedKey,
              option.implied[impliedKey],
              'implied',
            );
          });
      });
  }

  /**
   * Argument `name` is missing.
   *
   * @param {string} name
   * @private
   */

  missingArgument(name) {
    const message = `error: missing required argument '${name}'`;
    this.error(message, { code: 'commander.missingArgument' });
  }

  /**
   * `Option` is missing an argument.
   *
   * @param {Option} option
   * @private
   */

  optionMissingArgument(option) {
    const message = `error: option '${option.flags}' argument missing`;
    this.error(message, { code: 'commander.optionMissingArgument' });
  }

  /**
   * `Option` does not have a value, and is a mandatory option.
   *
   * @param {Option} option
   * @private
   */

  missingMandatoryOptionValue(option) {
    const message = `error: required option '${option.flags}' not specified`;
    this.error(message, { code: 'commander.missingMandatoryOptionValue' });
  }

  /**
   * `Option` conflicts with another option.
   *
   * @param {Option} option
   * @param {Option} conflictingOption
   * @private
   */
  _conflictingOption(option, conflictingOption) {
    // The calling code does not know whether a negated option is the source of the
    // value, so do some work to take an educated guess.
    const findBestOptionFromValue = (option) => {
      const optionKey = option.attributeName();
      const optionValue = this.getOptionValue(optionKey);
      const negativeOption = this.options.find(
        (target) => target.negate && optionKey === target.attributeName(),
      );
      const positiveOption = this.options.find(
        (target) => !target.negate && optionKey === target.attributeName(),
      );
      if (
        negativeOption &&
        ((negativeOption.presetArg === undefined && optionValue === false) ||
          (negativeOption.presetArg !== undefined &&
            optionValue === negativeOption.presetArg))
      ) {
        return negativeOption;
      }
      return positiveOption || option;
    };

    const getErrorMessage = (option) => {
      const bestOption = findBestOptionFromValue(option);
      const optionKey = bestOption.attributeName();
      const source = this.getOptionValueSource(optionKey);
      if (source === 'env') {
        return `environment variable '${bestOption.envVar}'`;
      }
      return `option '${bestOption.flags}'`;
    };

    const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
    this.error(message, { code: 'commander.conflictingOption' });
  }

  /**
   * Unknown option `flag`.
   *
   * @param {string} flag
   * @private
   */

  unknownOption(flag) {
    if (this._allowUnknownOption) return;
    let suggestion = '';

    if (flag.startsWith('--') && this._showSuggestionAfterError) {
      // Looping to pick up the global options too
      let candidateFlags = [];
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let command = this;
      do {
        const moreFlags = command
          .createHelp()
          .visibleOptions(command)
          .filter((option) => option.long)
          .map((option) => option.long);
        candidateFlags = candidateFlags.concat(moreFlags);
        command = command.parent;
      } while (command && !command._enablePositionalOptions);
      suggestion = suggestSimilar(flag, candidateFlags);
    }

    const message = `error: unknown option '${flag}'${suggestion}`;
    this.error(message, { code: 'commander.unknownOption' });
  }

  /**
   * Excess arguments, more than expected.
   *
   * @param {string[]} receivedArgs
   * @private
   */

  _excessArguments(receivedArgs) {
    if (this._allowExcessArguments) return;

    const expected = this.registeredArguments.length;
    const s = expected === 1 ? '' : 's';
    const forSubcommand = this.parent ? ` for '${this.name()}'` : '';
    const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
    this.error(message, { code: 'commander.excessArguments' });
  }

  /**
   * Unknown command.
   *
   * @private
   */

  unknownCommand() {
    const unknownName = this.args[0];
    let suggestion = '';

    if (this._showSuggestionAfterError) {
      const candidateNames = [];
      this.createHelp()
        .visibleCommands(this)
        .forEach((command) => {
          candidateNames.push(command.name());
          // just visible alias
          if (command.alias()) candidateNames.push(command.alias());
        });
      suggestion = suggestSimilar(unknownName, candidateNames);
    }

    const message = `error: unknown command '${unknownName}'${suggestion}`;
    this.error(message, { code: 'commander.unknownCommand' });
  }

  /**
   * Get or set the program version.
   *
   * This method auto-registers the "-V, --version" option which will print the version number.
   *
   * You can optionally supply the flags and description to override the defaults.
   *
   * @param {string} [str]
   * @param {string} [flags]
   * @param {string} [description]
   * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
   */

  version(str, flags, description) {
    if (str === undefined) return this._version;
    this._version = str;
    flags = flags || '-V, --version';
    description = description || 'output the version number';
    const versionOption = this.createOption(flags, description);
    this._versionOptionName = versionOption.attributeName();
    this._registerOption(versionOption);

    this.on('option:' + versionOption.name(), () => {
      this._outputConfiguration.writeOut(`${str}\n`);
      this._exit(0, 'commander.version', str);
    });
    return this;
  }

  /**
   * Set the description.
   *
   * @param {string} [str]
   * @param {object} [argsDescription]
   * @return {(string|Command)}
   */
  description(str, argsDescription) {
    if (str === undefined && argsDescription === undefined)
      return this._description;
    this._description = str;
    if (argsDescription) {
      this._argsDescription = argsDescription;
    }
    return this;
  }

  /**
   * Set the summary. Used when listed as subcommand of parent.
   *
   * @param {string} [str]
   * @return {(string|Command)}
   */
  summary(str) {
    if (str === undefined) return this._summary;
    this._summary = str;
    return this;
  }

  /**
   * Set an alias for the command.
   *
   * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
   *
   * @param {string} [alias]
   * @return {(string|Command)}
   */

  alias(alias) {
    if (alias === undefined) return this._aliases[0]; // just return first, for backwards compatibility

    /** @type {Command} */
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let command = this;
    if (
      this.commands.length !== 0 &&
      this.commands[this.commands.length - 1]._executableHandler
    ) {
      // assume adding alias for last added executable subcommand, rather than this
      command = this.commands[this.commands.length - 1];
    }

    if (alias === command._name)
      throw new Error("Command alias can't be the same as its name");
    const matchingCommand = this.parent?._findCommand(alias);
    if (matchingCommand) {
      // c.f. _registerCommand
      const existingCmd = [matchingCommand.name()]
        .concat(matchingCommand.aliases())
        .join('|');
      throw new Error(
        `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`,
      );
    }

    command._aliases.push(alias);
    return this;
  }

  /**
   * Set aliases for the command.
   *
   * Only the first alias is shown in the auto-generated help.
   *
   * @param {string[]} [aliases]
   * @return {(string[]|Command)}
   */

  aliases(aliases) {
    // Getter for the array of aliases is the main reason for having aliases() in addition to alias().
    if (aliases === undefined) return this._aliases;

    aliases.forEach((alias) => this.alias(alias));
    return this;
  }

  /**
   * Set / get the command usage `str`.
   *
   * @param {string} [str]
   * @return {(string|Command)}
   */

  usage(str) {
    if (str === undefined) {
      if (this._usage) return this._usage;

      const args = this.registeredArguments.map((arg) => {
        return humanReadableArgName(arg);
      });
      return []
        .concat(
          this.options.length || this._helpOption !== null ? '[options]' : [],
          this.commands.length ? '[command]' : [],
          this.registeredArguments.length ? args : [],
        )
        .join(' ');
    }

    this._usage = str;
    return this;
  }

  /**
   * Get or set the name of the command.
   *
   * @param {string} [str]
   * @return {(string|Command)}
   */

  name(str) {
    if (str === undefined) return this._name;
    this._name = str;
    return this;
  }

  /**
   * Set the name of the command from script filename, such as process.argv[1],
   * or require.main.filename, or __filename.
   *
   * (Used internally and public although not documented in README.)
   *
   * @example
   * program.nameFromFilename(require.main.filename);
   *
   * @param {string} filename
   * @return {Command}
   */

  nameFromFilename(filename) {
    this._name = path$b.basename(filename, path$b.extname(filename));

    return this;
  }

  /**
   * Get or set the directory for searching for executable subcommands of this command.
   *
   * @example
   * program.executableDir(__dirname);
   * // or
   * program.executableDir('subcommands');
   *
   * @param {string} [path]
   * @return {(string|null|Command)}
   */

  executableDir(path) {
    if (path === undefined) return this._executableDir;
    this._executableDir = path;
    return this;
  }

  /**
   * Return program help documentation.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
   * @return {string}
   */

  helpInformation(contextOptions) {
    const helper = this.createHelp();
    if (helper.helpWidth === undefined) {
      helper.helpWidth =
        contextOptions && contextOptions.error
          ? this._outputConfiguration.getErrHelpWidth()
          : this._outputConfiguration.getOutHelpWidth();
    }
    return helper.formatHelp(this, helper);
  }

  /**
   * @private
   */

  _getHelpContext(contextOptions) {
    contextOptions = contextOptions || {};
    const context = { error: !!contextOptions.error };
    let write;
    if (context.error) {
      write = (arg) => this._outputConfiguration.writeErr(arg);
    } else {
      write = (arg) => this._outputConfiguration.writeOut(arg);
    }
    context.write = contextOptions.write || write;
    context.command = this;
    return context;
  }

  /**
   * Output help information for this command.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */

  outputHelp(contextOptions) {
    let deprecatedCallback;
    if (typeof contextOptions === 'function') {
      deprecatedCallback = contextOptions;
      contextOptions = undefined;
    }
    const context = this._getHelpContext(contextOptions);

    this._getCommandAndAncestors()
      .reverse()
      .forEach((command) => command.emit('beforeAllHelp', context));
    this.emit('beforeHelp', context);

    let helpInformation = this.helpInformation(context);
    if (deprecatedCallback) {
      helpInformation = deprecatedCallback(helpInformation);
      if (
        typeof helpInformation !== 'string' &&
        !Buffer.isBuffer(helpInformation)
      ) {
        throw new Error('outputHelp callback must return a string or a Buffer');
      }
    }
    context.write(helpInformation);

    if (this._getHelpOption()?.long) {
      this.emit(this._getHelpOption().long); // deprecated
    }
    this.emit('afterHelp', context);
    this._getCommandAndAncestors().forEach((command) =>
      command.emit('afterAllHelp', context),
    );
  }

  /**
   * You can pass in flags and a description to customise the built-in help option.
   * Pass in false to disable the built-in help option.
   *
   * @example
   * program.helpOption('-?, --help' 'show help'); // customise
   * program.helpOption(false); // disable
   *
   * @param {(string | boolean)} flags
   * @param {string} [description]
   * @return {Command} `this` command for chaining
   */

  helpOption(flags, description) {
    // Support disabling built-in help option.
    if (typeof flags === 'boolean') {
      if (flags) {
        this._helpOption = this._helpOption ?? undefined; // preserve existing option
      } else {
        this._helpOption = null; // disable
      }
      return this;
    }

    // Customise flags and description.
    flags = flags ?? '-h, --help';
    description = description ?? 'display help for command';
    this._helpOption = this.createOption(flags, description);

    return this;
  }

  /**
   * Lazy create help option.
   * Returns null if has been disabled with .helpOption(false).
   *
   * @returns {(Option | null)} the help option
   * @package
   */
  _getHelpOption() {
    // Lazy create help option on demand.
    if (this._helpOption === undefined) {
      this.helpOption(undefined, undefined);
    }
    return this._helpOption;
  }

  /**
   * Supply your own option to use for the built-in help option.
   * This is an alternative to using helpOption() to customise the flags and description etc.
   *
   * @param {Option} option
   * @return {Command} `this` command for chaining
   */
  addHelpOption(option) {
    this._helpOption = option;
    return this;
  }

  /**
   * Output help information and exit.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */

  help(contextOptions) {
    this.outputHelp(contextOptions);
    let exitCode = process$2.exitCode || 0;
    if (
      exitCode === 0 &&
      contextOptions &&
      typeof contextOptions !== 'function' &&
      contextOptions.error
    ) {
      exitCode = 1;
    }
    // message: do not have all displayed text available so only passing placeholder.
    this._exit(exitCode, 'commander.help', '(outputHelp)');
  }

  /**
   * Add additional text to be displayed with the built-in help.
   *
   * Position is 'before' or 'after' to affect just this command,
   * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
   *
   * @param {string} position - before or after built-in help
   * @param {(string | Function)} text - string to add, or a function returning a string
   * @return {Command} `this` command for chaining
   */
  addHelpText(position, text) {
    const allowedValues = ['beforeAll', 'before', 'after', 'afterAll'];
    if (!allowedValues.includes(position)) {
      throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
    }
    const helpEvent = `${position}Help`;
    this.on(helpEvent, (context) => {
      let helpStr;
      if (typeof text === 'function') {
        helpStr = text({ error: context.error, command: context.command });
      } else {
        helpStr = text;
      }
      // Ignore falsy value when nothing to output.
      if (helpStr) {
        context.write(`${helpStr}\n`);
      }
    });
    return this;
  }

  /**
   * Output help information if help flags specified
   *
   * @param {Array} args - array of options to search for help flags
   * @private
   */

  _outputHelpIfRequested(args) {
    const helpOption = this._getHelpOption();
    const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
    if (helpRequested) {
      this.outputHelp();
      // (Do not have all displayed text available so only passing placeholder.)
      this._exit(0, 'commander.helpDisplayed', '(outputHelp)');
    }
  }
};

/**
 * Scan arguments and increment port number for inspect calls (to avoid conflicts when spawning new command).
 *
 * @param {string[]} args - array of arguments from node.execArgv
 * @returns {string[]}
 * @private
 */

function incrementNodeInspectorPort(args) {
  // Testing for these options:
  //  --inspect[=[host:]port]
  //  --inspect-brk[=[host:]port]
  //  --inspect-port=[host:]port
  return args.map((arg) => {
    if (!arg.startsWith('--inspect')) {
      return arg;
    }
    let debugOption;
    let debugHost = '127.0.0.1';
    let debugPort = '9229';
    let match;
    if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
      // e.g. --inspect
      debugOption = match[1];
    } else if (
      (match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null
    ) {
      debugOption = match[1];
      if (/^\d+$/.test(match[3])) {
        // e.g. --inspect=1234
        debugPort = match[3];
      } else {
        // e.g. --inspect=localhost
        debugHost = match[3];
      }
    } else if (
      (match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null
    ) {
      // e.g. --inspect=localhost:1234
      debugOption = match[1];
      debugHost = match[3];
      debugPort = match[4];
    }

    if (debugOption && debugPort !== '0') {
      return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
    }
    return arg;
  });
}

command.Command = Command$2;

const { Argument: Argument$1 } = argument;
const { Command: Command$1 } = command;
const { CommanderError: CommanderError$1, InvalidArgumentError: InvalidArgumentError$1 } = error;
const { Help: Help$1 } = help;
const { Option: Option$1 } = option;

commander.program = new Command$1();

commander.createCommand = (name) => new Command$1(name);
commander.createOption = (flags, description) => new Option$1(flags, description);
commander.createArgument = (name, description) => new Argument$1(name, description);

/**
 * Expose classes
 */

commander.Command = Command$1;
commander.Option = Option$1;
commander.Argument = Argument$1;
commander.Help = Help$1;

commander.CommanderError = CommanderError$1;
commander.InvalidArgumentError = InvalidArgumentError$1;
commander.InvalidOptionArgumentError = InvalidArgumentError$1; // Deprecated

// wrapper to provide named exports for ESM.
const {
  program,
  createCommand,
  createArgument,
  createOption,
  CommanderError,
  InvalidArgumentError,
  InvalidOptionArgumentError, // deprecated old name
  Command,
  Argument,
  Option,
  Help,
} = commander;

var npmConf$1 = {exports: {}};

var configChain = {exports: {}};

var protoList = ProtoList$1;

function setProto(obj, proto) {
  if (typeof Object.setPrototypeOf === "function")
    return Object.setPrototypeOf(obj, proto)
  else
    obj.__proto__ = proto;
}

function ProtoList$1 () {
  this.list = [];
  var root = null;
  Object.defineProperty(this, 'root', {
    get: function () { return root },
    set: function (r) {
      root = r;
      if (this.list.length) {
        setProto(this.list[this.list.length - 1], r);
      }
    },
    enumerable: true,
    configurable: true
  });
}

ProtoList$1.prototype =
  { get length () { return this.list.length }
  , get keys () {
      var k = [];
      for (var i in this.list[0]) k.push(i);
      return k
    }
  , get snapshot () {
      var o = {};
      this.keys.forEach(function (k) { o[k] = this.get(k); }, this);
      return o
    }
  , get store () {
      return this.list[0]
    }
  , push : function (obj) {
      if (typeof obj !== "object") obj = {valueOf:obj};
      if (this.list.length >= 1) {
        setProto(this.list[this.list.length - 1], obj);
      }
      setProto(obj, this.root);
      return this.list.push(obj)
    }
  , pop : function () {
      if (this.list.length >= 2) {
        setProto(this.list[this.list.length - 2], this.root);
      }
      return this.list.pop()
    }
  , unshift : function (obj) {
      setProto(obj, this.list[0] || this.root);
      return this.list.unshift(obj)
    }
  , shift : function () {
      if (this.list.length === 1) {
        setProto(this.list[0], this.root);
      }
      return this.list.shift()
    }
  , get : function (key) {
      return this.list[0][key]
    }
  , set : function (key, val, save) {
      if (!this.length) this.push({});
      if (save && this.list[0].hasOwnProperty(key)) this.push({});
      return this.list[0][key] = val
    }
  , forEach : function (fn, thisp) {
      for (var key in this.list[0]) fn.call(thisp, key, this.list[0][key]);
    }
  , slice : function () {
      return this.list.slice.apply(this.list, arguments)
    }
  , splice : function () {
      // handle injections
      var ret = this.list.splice.apply(this.list, arguments);
      for (var i = 0, l = this.list.length; i < l; i++) {
        setProto(this.list[i], this.list[i + 1] || this.root);
      }
      return ret
    }
  };

var ini$1 = {};

ini$1.parse = ini$1.decode = decode$1;

ini$1.stringify = ini$1.encode = encode$1;

ini$1.safe = safe;
ini$1.unsafe = unsafe;

var eol = typeof process !== 'undefined' &&
  process.platform === 'win32' ? '\r\n' : '\n';

function encode$1 (obj, opt) {
  var children = [];
  var out = '';

  if (typeof opt === 'string') {
    opt = {
      section: opt,
      whitespace: false,
    };
  } else {
    opt = opt || {};
    opt.whitespace = opt.whitespace === true;
  }

  var separator = opt.whitespace ? ' = ' : '=';

  Object.keys(obj).forEach(function (k, _, __) {
    var val = obj[k];
    if (val && Array.isArray(val)) {
      val.forEach(function (item) {
        out += safe(k + '[]') + separator + safe(item) + '\n';
      });
    } else if (val && typeof val === 'object')
      children.push(k);
    else
      out += safe(k) + separator + safe(val) + eol;
  });

  if (opt.section && out.length)
    out = '[' + safe(opt.section) + ']' + eol + out;

  children.forEach(function (k, _, __) {
    var nk = dotSplit(k).join('\\.');
    var section = (opt.section ? opt.section + '.' : '') + nk;
    var child = encode$1(obj[k], {
      section: section,
      whitespace: opt.whitespace,
    });
    if (out.length && child.length)
      out += eol;

    out += child;
  });

  return out
}

function dotSplit (str) {
  return str.replace(/\1/g, '\u0002LITERAL\\1LITERAL\u0002')
    .replace(/\\\./g, '\u0001')
    .split(/\./).map(function (part) {
      return part.replace(/\1/g, '\\.')
        .replace(/\2LITERAL\\1LITERAL\2/g, '\u0001')
    })
}

function decode$1 (str) {
  var out = {};
  var p = out;
  var section = null;
  //          section     |key      = value
  var re = /^\[([^\]]*)\]$|^([^=]+)(=(.*))?$/i;
  var lines = str.split(/[\r\n]+/g);

  lines.forEach(function (line, _, __) {
    if (!line || line.match(/^\s*[;#]/))
      return
    var match = line.match(re);
    if (!match)
      return
    if (match[1] !== undefined) {
      section = unsafe(match[1]);
      if (section === '__proto__') {
        // not allowed
        // keep parsing the section, but don't attach it.
        p = {};
        return
      }
      p = out[section] = out[section] || {};
      return
    }
    var key = unsafe(match[2]);
    if (key === '__proto__')
      return
    var value = match[3] ? unsafe(match[4]) : true;
    switch (value) {
      case 'true':
      case 'false':
      case 'null': value = JSON.parse(value);
    }

    // Convert keys with '[]' suffix to an array
    if (key.length > 2 && key.slice(-2) === '[]') {
      key = key.substring(0, key.length - 2);
      if (key === '__proto__')
        return
      if (!p[key])
        p[key] = [];
      else if (!Array.isArray(p[key]))
        p[key] = [p[key]];
    }

    // safeguard against resetting a previously defined
    // array by accidentally forgetting the brackets
    if (Array.isArray(p[key]))
      p[key].push(value);
    else
      p[key] = value;
  });

  // {a:{y:1},"a.b":{x:2}} --> {a:{y:1,b:{x:2}}}
  // use a filter to return the keys that have to be deleted.
  Object.keys(out).filter(function (k, _, __) {
    if (!out[k] ||
      typeof out[k] !== 'object' ||
      Array.isArray(out[k]))
      return false

    // see if the parent section is also an object.
    // if so, add it to that, and mark this one for deletion
    var parts = dotSplit(k);
    var p = out;
    var l = parts.pop();
    var nl = l.replace(/\\\./g, '.');
    parts.forEach(function (part, _, __) {
      if (part === '__proto__')
        return
      if (!p[part] || typeof p[part] !== 'object')
        p[part] = {};
      p = p[part];
    });
    if (p === out && nl === l)
      return false

    p[nl] = out[k];
    return true
  }).forEach(function (del, _, __) {
    delete out[del];
  });

  return out
}

function isQuoted (val) {
  return (val.charAt(0) === '"' && val.slice(-1) === '"') ||
    (val.charAt(0) === "'" && val.slice(-1) === "'")
}

function safe (val) {
  return (typeof val !== 'string' ||
    val.match(/[=\r\n]/) ||
    val.match(/^\[/) ||
    (val.length > 1 &&
     isQuoted(val)) ||
    val !== val.trim())
    ? JSON.stringify(val)
    : val.replace(/;/g, '\\;').replace(/#/g, '\\#')
}

function unsafe (val, doUnesc) {
  val = (val || '').trim();
  if (isQuoted(val)) {
    // remove the single quotes before calling JSON.parse
    if (val.charAt(0) === "'")
      val = val.substr(1, val.length - 2);

    try {
      val = JSON.parse(val);
    } catch (_) {}
  } else {
    // walk the val to find the first not-escaped ; character
    var esc = false;
    var unesc = '';
    for (var i = 0, l = val.length; i < l; i++) {
      var c = val.charAt(i);
      if (esc) {
        if ('\\;#'.indexOf(c) !== -1)
          unesc += c;
        else
          unesc += '\\' + c;

        esc = false;
      } else if (';#'.indexOf(c) !== -1)
        break
      else if (c === '\\')
        esc = true;
      else
        unesc += c;
    }
    if (esc)
      unesc += '\\';

    return unesc.trim()
  }
  return val
}

var ProtoList = protoList
  , path$a = require$$1$1
  , fs$a = require$$0$3
  , ini = ini$1
  , EE = require$$4.EventEmitter
  , url$5 = require$$0$4
  , http$3 = require$$1$2;

var exports = configChain.exports = function () {
  var args = [].slice.call(arguments)
    , conf = new ConfigChain$1();

  while(args.length) {
    var a = args.shift();
    if(a) conf.push
          ( 'string' === typeof a
            ? json(a)
            : a );
  }

  return conf
};

//recursively find a file...

exports.find = function () {
  var rel = path$a.join.apply(null, [].slice.call(arguments));

  function find(start, rel) {
    var file = path$a.join(start, rel);
    try {
      fs$a.statSync(file);
      return file
    } catch (err) {
      if(path$a.dirname(start) !== start) // root
        return find(path$a.dirname(start), rel)
    }
  }
  return find(__dirname, rel)
};

var parse$2 = exports.parse = function (content, file, type) {
  content = '' + content;
  // if we don't know what it is, try json and fall back to ini
  // if we know what it is, then it must be that.
  if (!type) {
    try { return JSON.parse(content) }
    catch (er) { return ini.parse(content) }
  } else if (type === 'json') {
    if (this.emit) {
      try { return JSON.parse(content) }
      catch (er) { this.emit('error', er); }
    } else {
      return JSON.parse(content)
    }
  } else {
    return ini.parse(content)
  }
};

var json = exports.json = function () {
  var args = [].slice.call(arguments).filter(function (arg) { return arg != null });
  var file = path$a.join.apply(null, args);
  var content;
  try {
    content = fs$a.readFileSync(file,'utf-8');
  } catch (err) {
    return
  }
  return parse$2(content, file, 'json')
};

exports.env = function (prefix, env) {
  env = env || process.env;
  var obj = {};
  var l = prefix.length;
  for(var k in env) {
    if(k.indexOf(prefix) === 0)
      obj[k.substring(l)] = env[k];
  }

  return obj
};

exports.ConfigChain = ConfigChain$1;
function ConfigChain$1 () {
  EE.apply(this);
  ProtoList.apply(this, arguments);
  this._awaiting = 0;
  this._saving = 0;
  this.sources = {};
}

// multi-inheritance-ish
var extras = {
  constructor: { value: ConfigChain$1 }
};
Object.keys(EE.prototype).forEach(function (k) {
  extras[k] = Object.getOwnPropertyDescriptor(EE.prototype, k);
});
ConfigChain$1.prototype = Object.create(ProtoList.prototype, extras);

ConfigChain$1.prototype.del = function (key, where) {
  // if not specified where, then delete from the whole chain, scorched
  // earth style
  if (where) {
    var target = this.sources[where];
    target = target && target.data;
    if (!target) {
      return this.emit('error', new Error('not found '+where))
    }
    delete target[key];
  } else {
    for (var i = 0, l = this.list.length; i < l; i ++) {
      delete this.list[i][key];
    }
  }
  return this
};

ConfigChain$1.prototype.set = function (key, value, where) {
  var target;

  if (where) {
    target = this.sources[where];
    target = target && target.data;
    if (!target) {
      return this.emit('error', new Error('not found '+where))
    }
  } else {
    target = this.list[0];
    if (!target) {
      return this.emit('error', new Error('cannot set, no confs!'))
    }
  }
  target[key] = value;
  return this
};

ConfigChain$1.prototype.get = function (key, where) {
  if (where) {
    where = this.sources[where];
    if (where) where = where.data;
    if (where && Object.hasOwnProperty.call(where, key)) return where[key]
    return undefined
  }
  return this.list[0][key]
};

ConfigChain$1.prototype.save = function (where, type, cb) {
  if (typeof type === 'function') cb = type, type = null;
  var target = this.sources[where];
  if (!target || !(target.path || target.source) || !target.data) {
    // TODO: maybe save() to a url target could be a PUT or something?
    // would be easy to swap out with a reddis type thing, too
    return this.emit('error', new Error('bad save target: '+where))
  }

  if (target.source) {
    var pref = target.prefix || '';
    Object.keys(target.data).forEach(function (k) {
      target.source[pref + k] = target.data[k];
    });
    return this
  }

  var type = type || target.type;
  var data = target.data;
  if (target.type === 'json') {
    data = JSON.stringify(data);
  } else {
    data = ini.stringify(data);
  }

  this._saving ++;
  fs$a.writeFile(target.path, data, 'utf8', function (er) {
    this._saving --;
    if (er) {
      if (cb) return cb(er)
      else return this.emit('error', er)
    }
    if (this._saving === 0) {
      if (cb) cb();
      this.emit('save');
    }
  }.bind(this));
  return this
};

ConfigChain$1.prototype.addFile = function (file, type, name) {
  name = name || file;
  var marker = {__source__:name};
  this.sources[name] = { path: file, type: type };
  this.push(marker);
  this._await();
  fs$a.readFile(file, 'utf8', function (er, data) {
    if (er) this.emit('error', er);
    this.addString(data, file, type, marker);
  }.bind(this));
  return this
};

ConfigChain$1.prototype.addEnv = function (prefix, env, name) {
  name = name || 'env';
  var data = exports.env(prefix, env);
  this.sources[name] = { data: data, source: env, prefix: prefix };
  return this.add(data, name)
};

ConfigChain$1.prototype.addUrl = function (req, type, name) {
  this._await();
  var href = url$5.format(req);
  name = name || href;
  var marker = {__source__:name};
  this.sources[name] = { href: href, type: type };
  this.push(marker);
  http$3.request(req, function (res) {
    var c = [];
    var ct = res.headers['content-type'];
    if (!type) {
      type = ct.indexOf('json') !== -1 ? 'json'
           : ct.indexOf('ini') !== -1 ? 'ini'
           : href.match(/\.json$/) ? 'json'
           : href.match(/\.ini$/) ? 'ini'
           : null;
      marker.type = type;
    }

    res.on('data', c.push.bind(c))
    .on('end', function () {
      this.addString(Buffer.concat(c), href, type, marker);
    }.bind(this))
    .on('error', this.emit.bind(this, 'error'));

  }.bind(this))
  .on('error', this.emit.bind(this, 'error'))
  .end();

  return this
};

ConfigChain$1.prototype.addString = function (data, file, type, marker) {
  data = this.parse(data, file, type);
  this.add(data, marker);
  return this
};

ConfigChain$1.prototype.add = function (data, marker) {
  if (marker && typeof marker === 'object') {
    var i = this.list.indexOf(marker);
    if (i === -1) {
      return this.emit('error', new Error('bad marker'))
    }
    this.splice(i, 1, data);
    marker = marker.__source__;
    this.sources[marker] = this.sources[marker] || {};
    this.sources[marker].data = data;
    // we were waiting for this.  maybe emit 'load'
    this._resolve();
  } else {
    if (typeof marker === 'string') {
      this.sources[marker] = this.sources[marker] || {};
      this.sources[marker].data = data;
    }
    // trigger the load event if nothing was already going to do so.
    this._await();
    this.push(data);
    process.nextTick(this._resolve.bind(this));
  }
  return this
};

ConfigChain$1.prototype.parse = exports.parse;

ConfigChain$1.prototype._await = function () {
  this._awaiting++;
};

ConfigChain$1.prototype._resolve = function () {
  this._awaiting--;
  if (this._awaiting === 0) this.emit('load', this);
};

var configChainExports = configChain.exports;

var util$a = {};

var types$1 = {};

const path$9 = require$$1$1;
	const Stream$4 = require$$0$5.Stream;
	const url$4 = require$$0$4;

	const Umask = () => {};
	const getLocalAddresses = () => [];
	const semver = () => {};

	types$1.types = {
  access: [null, 'restricted', 'public'],
  'allow-same-version': Boolean,
  'always-auth': Boolean,
  also: [null, 'dev', 'development'],
  'auth-type': ['legacy', 'sso', 'saml', 'oauth'],
  'bin-links': Boolean,
  browser: [null, String],
  ca: [null, String, Array],
  cafile: path$9,
  cache: path$9,
  'cache-lock-stale': Number,
  'cache-lock-retries': Number,
  'cache-lock-wait': Number,
  'cache-max': Number,
  'cache-min': Number,
  cert: [null, String],
  color: ['always', Boolean],
  depth: Number,
  description: Boolean,
  dev: Boolean,
  'dry-run': Boolean,
  editor: String,
  'engine-strict': Boolean,
  force: Boolean,
  'fetch-retries': Number,
  'fetch-retry-factor': Number,
  'fetch-retry-mintimeout': Number,
  'fetch-retry-maxtimeout': Number,
  git: String,
  'git-tag-version': Boolean,
  global: Boolean,
  globalconfig: path$9,
  'global-style': Boolean,
  group: [Number, String],
  'https-proxy': [null, url$4],
  'user-agent': String,
  'ham-it-up': Boolean,
  'heading': String,
  'if-present': Boolean,
  'ignore-prepublish': Boolean,
  'ignore-scripts': Boolean,
  'init-module': path$9,
  'init-author-name': String,
  'init-author-email': String,
  'init-author-url': ['', url$4],
  'init-license': String,
  'init-version': semver,
  json: Boolean,
  key: [null, String],
  'legacy-bundling': Boolean,
  link: Boolean,
  // local-address must be listed as an IP for a local network interface
  // must be IPv4 due to node bug
  'local-address': getLocalAddresses(),
  loglevel: ['silent', 'error', 'warn', 'notice', 'http', 'timing', 'info', 'verbose', 'silly'],
  logstream: Stream$4,
  'logs-max': Number,
  long: Boolean,
  maxsockets: Number,
  message: String,
  'metrics-registry': [null, String],
  'node-version': [null, semver],
  offline: Boolean,
  'onload-script': [null, String],
  only: [null, 'dev', 'development', 'prod', 'production'],
  optional: Boolean,
  'package-lock': Boolean,
  parseable: Boolean,
  'prefer-offline': Boolean,
  'prefer-online': Boolean,
  prefix: path$9,
  production: Boolean,
  progress: Boolean,
  'proprietary-attribs': Boolean,
  proxy: [null, false, url$4],
  // allow proxy to be disabled explicitly
  'rebuild-bundle': Boolean,
  registry: [null, url$4],
  rollback: Boolean,
  save: Boolean,
  'save-bundle': Boolean,
  'save-dev': Boolean,
  'save-exact': Boolean,
  'save-optional': Boolean,
  'save-prefix': String,
  'save-prod': Boolean,
  scope: String,
  'script-shell': [null, String],
  'scripts-prepend-node-path': [false, true, 'auto', 'warn-only'],
  searchopts: String,
  searchexclude: [null, String],
  searchlimit: Number,
  searchstaleness: Number,
  'send-metrics': Boolean,
  shell: String,
  shrinkwrap: Boolean,
  'sign-git-tag': Boolean,
  'sso-poll-frequency': Number,
  'sso-type': [null, 'oauth', 'saml'],
  'strict-ssl': Boolean,
  tag: String,
  timing: Boolean,
  tmp: path$9,
  unicode: Boolean,
  'unsafe-perm': Boolean,
  usage: Boolean,
  user: [Number, String],
  userconfig: path$9,
  umask: Umask,
  version: Boolean,
  'tag-version-prefix': String,
  versions: Boolean,
  viewer: String,
  _exit: Boolean
};

const fs$9 = require$$0$3;
const path$8 = require$$1$1;
const types = types$1;

// https://github.com/npm/npm/blob/latest/lib/config/core.js#L409-L423
const envReplace = str => {
	if (typeof str !== 'string' || !str) {
		return str;
	}

	// Replace any ${ENV} values with the appropriate environment
	const regex = /(\\*)\$\{([^}]+)\}/g;

	return str.replace(regex, (orig, esc, name) => {
		esc = esc.length > 0 && esc.length % 2;

		if (esc) {
			return orig;
		}

		if (process.env[name] === undefined) {
			throw new Error(`Failed to replace env in config: ${orig}`);
		}

		return process.env[name];
	});
};

// https://github.com/npm/npm/blob/latest/lib/config/core.js#L362-L407
const parseField = (field, key) => {
	if (typeof field !== 'string') {
		return field;
	}

	const typeList = [].concat(types[key]);
	const isPath = typeList.indexOf(path$8) !== -1;
	const isBool = typeList.indexOf(Boolean) !== -1;
	const isString = typeList.indexOf(String) !== -1;
	const isNumber = typeList.indexOf(Number) !== -1;

	field = `${field}`.trim();

	if (/^".*"$/.test(field)) {
		try {
			field = JSON.parse(field);
		} catch (err) {
			throw new Error(`Failed parsing JSON config key ${key}: ${field}`);
		}
	}

	if (isBool && !isString && field === '') {
		return true;
	}

	switch (field) { // eslint-disable-line default-case
		case 'true': {
			return true;
		}

		case 'false': {
			return false;
		}

		case 'null': {
			return null;
		}

		case 'undefined': {
			return undefined;
		}
	}

	field = envReplace(field);

	if (isPath) {
		const regex = process.platform === 'win32' ? /^~(\/|\\)/ : /^~\//;

		if (regex.test(field) && process.env.HOME) {
			field = path$8.resolve(process.env.HOME, field.substr(2));
		}

		field = path$8.resolve(field);
	}

	if (isNumber && !field.isNan()) {
		field = Number(field);
	}

	return field;
};

// https://github.com/npm/npm/blob/latest/lib/config/find-prefix.js
const findPrefix = name => {
	name = path$8.resolve(name);

	let walkedUp = false;

	while (path$8.basename(name) === 'node_modules') {
		name = path$8.dirname(name);
		walkedUp = true;
	}

	if (walkedUp) {
		return name;
	}

	const find = (name, original) => {
		const regex = /^[a-zA-Z]:(\\|\/)?$/;

		if (name === '/' || (process.platform === 'win32' && regex.test(name))) {
			return original;
		}

		try {
			const files = fs$9.readdirSync(name);

			if (files.indexOf('node_modules') !== -1 || files.indexOf('package.json') !== -1) {
				return name;
			}

			const dirname = path$8.dirname(name);

			if (dirname === name) {
				return original;
			}

			return find(dirname, original);
		} catch (err) {
			if (name === original) {
				if (err.code === 'ENOENT') {
					return original;
				}

				throw err;
			}

			return original;
		}
	};

	return find(name, name);
};

util$a.envReplace = envReplace;
util$a.findPrefix = findPrefix;
util$a.parseField = parseField;

const fs$8 = require$$0$3;
const path$7 = require$$1$1;
const ConfigChain = configChainExports.ConfigChain;
const util$9 = util$a;

let Conf$1 = class Conf extends ConfigChain {
	// https://github.com/npm/npm/blob/latest/lib/config/core.js#L208-L222
	constructor(base) {
		super(base);
		this.root = base;
	}

	// https://github.com/npm/npm/blob/latest/lib/config/core.js#L332-L342
	add(data, marker) {
		try {
			for (const x of Object.keys(data)) {
				data[x] = util$9.parseField(data[x], x);
			}
		} catch (err) {
			throw err;
		}

		return super.add(data, marker);
	}

	// https://github.com/npm/npm/blob/latest/lib/config/core.js#L312-L325
	addFile(file, name) {
		name = name || file;

		const marker = {__source__: name};

		this.sources[name] = {path: file, type: 'ini'};
		this.push(marker);
		this._await();

		try {
			const contents = fs$8.readFileSync(file, 'utf8');
			this.addString(contents, file, 'ini', marker);
		} catch (err) {
			this.add({}, marker);
		}

		return this;
	}

	// https://github.com/npm/npm/blob/latest/lib/config/core.js#L344-L360
	addEnv(env) {
		env = env || process.env;

		const conf = {};

		Object.keys(env)
			.filter(x => /^npm_config_/i.test(x))
			.forEach(x => {
				if (!env[x]) {
					return;
				}

				const p = x.toLowerCase()
					.replace(/^npm_config_/, '')
					.replace(/(?!^)_/g, '-');

				conf[p] = env[x];
			});

		return super.addEnv('', conf, 'env');
	}

	// https://github.com/npm/npm/blob/latest/lib/config/load-prefix.js
	loadPrefix() {
		const cli = this.list[0];

		Object.defineProperty(this, 'prefix', {
			enumerable: true,
			set: prefix => {
				const g = this.get('global');
				this[g ? 'globalPrefix' : 'localPrefix'] = prefix;
			},
			get: () => {
				const g = this.get('global');
				return g ? this.globalPrefix : this.localPrefix;
			}
		});

		Object.defineProperty(this, 'globalPrefix', {
			enumerable: true,
			set: prefix => {
				this.set('prefix', prefix);
			},
			get: () => {
				return path$7.resolve(this.get('prefix'));
			}
		});

		let p;

		Object.defineProperty(this, 'localPrefix', {
			enumerable: true,
			set: prefix => {
				p = prefix;
			},
			get: () => {
				return p;
			}
		});

		if (Object.prototype.hasOwnProperty.call(cli, 'prefix')) {
			p = path$7.resolve(cli.prefix);
		} else {
			try {
				const prefix = util$9.findPrefix(process.cwd());
				p = prefix;
			} catch (err) {
				throw err;
			}
		}

		return p;
	}

	// https://github.com/npm/npm/blob/latest/lib/config/load-cafile.js
	loadCAFile(file) {
		if (!file) {
			return;
		}

		try {
			const contents = fs$8.readFileSync(file, 'utf8');
			const delim = '-----END CERTIFICATE-----';
			const output = contents
				.split(delim)
				.filter(x => Boolean(x.trim()))
				.map(x => x.trimLeft() + delim);

			this.set('ca', output);
		} catch (err) {
			if (err.code === 'ENOENT') {
				return;
			}

			throw err;
		}
	}

	// https://github.com/npm/npm/blob/latest/lib/config/set-user.js
	loadUser() {
		const defConf = this.root;

		if (this.get('global')) {
			return;
		}

		if (process.env.SUDO_UID) {
			defConf.user = Number(process.env.SUDO_UID);
			return;
		}

		const prefix = path$7.resolve(this.get('prefix'));

		try {
			const stats = fs$8.statSync(prefix);
			defConf.user = stats.uid;
		} catch (err) {
			if (err.code === 'ENOENT') {
				return;
			}

			throw err;
		}
	}
};

var conf = Conf$1;

var defaults$4 = {};

(function (exports) {
		const os = require$$0$6;
		const path = require$$1$1;

		const temp = os.tmpdir();
		const uidOrPid = process.getuid ? process.getuid() : process.pid;
		const hasUnicode = () => true;
		const isWindows = process.platform === 'win32';

		const osenv = {
			editor: () => process.env.EDITOR || process.env.VISUAL || (isWindows ? 'notepad.exe' : 'vi'),
			shell: () => isWindows ? (process.env.COMSPEC || 'cmd.exe') : (process.env.SHELL || '/bin/bash')
		};

		const umask = {
			fromString: () => process.umask()
		};

		let home = os.homedir();

		if (home) {
			process.env.HOME = home;
		} else {
			home = path.resolve(temp, 'npm-' + uidOrPid);
		}

		const cacheExtra = process.platform === 'win32' ? 'npm-cache' : '.npm';
		const cacheRoot = process.platform === 'win32' ? process.env.APPDATA : home;
		const cache = path.resolve(cacheRoot, cacheExtra);

		let defaults;
		let globalPrefix;

		Object.defineProperty(exports, 'defaults', {
	  get: function () {
	    if (defaults) return defaults;

	    if (process.env.PREFIX) {
	      globalPrefix = process.env.PREFIX;
	    } else if (process.platform === 'win32') {
	      // c:\node\node.exe --> prefix=c:\node\
	      globalPrefix = path.dirname(process.execPath);
	    } else {
	      // /usr/local/bin/node --> prefix=/usr/local
	      globalPrefix = path.dirname(path.dirname(process.execPath)); // destdir only is respected on Unix

	      if (process.env.DESTDIR) {
	        globalPrefix = path.join(process.env.DESTDIR, globalPrefix);
	      }
	    }

	    defaults = {
	      access: null,
	      'allow-same-version': false,
	      'always-auth': false,
	      also: null,
	      'auth-type': 'legacy',
	      'bin-links': true,
	      browser: null,
	      ca: null,
	      cafile: null,
	      cache: cache,
	      'cache-lock-stale': 60000,
	      'cache-lock-retries': 10,
	      'cache-lock-wait': 10000,
	      'cache-max': Infinity,
	      'cache-min': 10,
	      cert: null,
	      color: true,
	      depth: Infinity,
	      description: true,
	      dev: false,
	      'dry-run': false,
	      editor: osenv.editor(),
	      'engine-strict': false,
	      force: false,
	      'fetch-retries': 2,
	      'fetch-retry-factor': 10,
	      'fetch-retry-mintimeout': 10000,
	      'fetch-retry-maxtimeout': 60000,
	      git: 'git',
	      'git-tag-version': true,
	      global: false,
	      globalconfig: path.resolve(globalPrefix, 'etc', 'npmrc'),
	      'global-style': false,
	      group: process.platform === 'win32' ? 0 : process.env.SUDO_GID || process.getgid && process.getgid(),
	      'ham-it-up': false,
	      heading: 'npm',
	      'if-present': false,
	      'ignore-prepublish': false,
	      'ignore-scripts': false,
	      'init-module': path.resolve(home, '.npm-init.js'),
	      'init-author-name': '',
	      'init-author-email': '',
	      'init-author-url': '',
	      'init-version': '1.0.0',
	      'init-license': 'ISC',
	      json: false,
	      key: null,
	      'legacy-bundling': false,
	      link: false,
	      'local-address': undefined,
	      loglevel: 'notice',
	      logstream: process.stderr,
	      'logs-max': 10,
	      long: false,
	      maxsockets: 50,
	      message: '%s',
	      'metrics-registry': null,
	      'node-version': process.version,
	      'offline': false,
	      'onload-script': false,
	      only: null,
	      optional: true,
	      'package-lock': true,
	      parseable: false,
	      'prefer-offline': false,
	      'prefer-online': false,
	      prefix: globalPrefix,
	      production: process.env.NODE_ENV === 'production',
	      'progress': !process.env.TRAVIS && !process.env.CI,
	      'proprietary-attribs': true,
	      proxy: null,
	      'https-proxy': null,
	      'user-agent': 'npm/{npm-version} ' + 'node/{node-version} ' + '{platform} ' + '{arch}',
	      'rebuild-bundle': true,
	      registry: 'https://registry.npmjs.org/',
	      rollback: true,
	      save: true,
	      'save-bundle': false,
	      'save-dev': false,
	      'save-exact': false,
	      'save-optional': false,
	      'save-prefix': '^',
	      'save-prod': false,
	      scope: '',
	      'script-shell': null,
	      'scripts-prepend-node-path': 'warn-only',
	      searchopts: '',
	      searchexclude: null,
	      searchlimit: 20,
	      searchstaleness: 15 * 60,
	      'send-metrics': false,
	      shell: osenv.shell(),
	      shrinkwrap: true,
	      'sign-git-tag': false,
	      'sso-poll-frequency': 500,
	      'sso-type': 'oauth',
	      'strict-ssl': true,
	      tag: 'latest',
	      'tag-version-prefix': 'v',
	      timing: false,
	      tmp: temp,
	      unicode: hasUnicode(),
	      'unsafe-perm': process.platform === 'win32' || process.platform === 'cygwin' || !(process.getuid && process.setuid && process.getgid && process.setgid) || process.getuid() !== 0,
	      usage: false,
	      user: process.platform === 'win32' ? 0 : 'nobody',
	      userconfig: path.resolve(home, '.npmrc'),
	      umask: process.umask ? process.umask() : umask.fromString('022'),
	      version: false,
	      versions: false,
	      viewer: process.platform === 'win32' ? 'browser' : 'man',
	      _exit: true
	    };
	    return defaults;
	  }
	}); 
} (defaults$4));

const path$6 = require$$1$1;
const Conf = conf;
const defaults$3 = defaults$4;

// https://github.com/npm/npm/blob/latest/lib/config/core.js#L101-L200
npmConf$1.exports = opts => {
	const conf = new Conf(Object.assign({}, defaults$3.defaults));

	conf.add(Object.assign({}, opts), 'cli');
	conf.addEnv();
	conf.loadPrefix();

	const projectConf = path$6.resolve(conf.localPrefix, '.npmrc');
	const userConf = conf.get('userconfig');

	if (!conf.get('global') && projectConf !== userConf) {
		conf.addFile(projectConf, 'project');
	} else {
		conf.add({}, 'project');
	}

	conf.addFile(conf.get('userconfig'), 'user');

	if (conf.get('prefix')) {
		const etc = path$6.resolve(conf.get('prefix'), 'etc');
		conf.root.globalconfig = path$6.resolve(etc, 'npmrc');
		conf.root.globalignorefile = path$6.resolve(etc, 'npmignore');
	}

	conf.addFile(conf.get('globalconfig'), 'global');
	conf.loadUser();

	const caFile = conf.get('cafile');

	if (caFile) {
		conf.loadCAFile(caFile);
	}

	return conf;
};

npmConf$1.exports.defaults = Object.assign({}, defaults$3.defaults);

var npmConfExports = npmConf$1.exports;

const npmConf = npmConfExports();

var getProxy$1 = () => {
	return process.env.HTTPS_PROXY ||
		process.env.https_proxy ||
		process.env.HTTP_PROXY ||
		process.env.http_proxy ||
		npmConf.get('https-proxy') ||
		npmConf.get('http-proxy') ||
		npmConf.get('proxy') ||
		null;
};

/**
 * @file Tests if ES6 Symbol is supported.
 * @version 1.4.2
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-symbol-support-x
 */

/**
 * Indicates if `Symbol`exists and creates the correct type.
 * `true`, if it exists and creates the correct type, otherwise `false`.
 *
 * @type boolean
 */
var hasSymbolSupportX = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';

/**
 * @file Tests if ES6 @@toStringTag is supported.
 * @see {@link http://www.ecma-international.org/ecma-262/6.0/#sec-@@tostringtag|26.3.1 @@toStringTag}
 * @version 1.4.1
 * @author Xotic750 <Xotic750@gmail.com>
 * @copyright  Xotic750
 * @license {@link <https://opensource.org/licenses/MIT> MIT}
 * @module has-to-string-tag-x
 */

/**
 * Indicates if `Symbol.toStringTag`exists and is the correct type.
 * `true`, if it exists and is the correct type, otherwise `false`.
 *
 * @type boolean
 */
var hasToStringTagX = hasSymbolSupportX && typeof Symbol.toStringTag === 'symbol';

var isObject$1 = function isObject(x) {
	return typeof x === 'object' && x !== null;
};

const hasToStringTag = hasToStringTagX;
const isObject = isObject$1;

const toString$1 = Object.prototype.toString;
const urlClass = "[object URL]";

const hash = "hash";
const host = "host";
const hostname = "hostname";
const href = "href";
const password = "password";
const pathname = "pathname";
const port = "port";
const protocol = "protocol";
const search = "search";
const username = "username";



const isURL$1 = (url, supportIncomplete/*=false*/) =>
{
	if (!isObject(url)) return false;

	// Native implementation in older browsers
	if (!hasToStringTag && toString$1.call(url) === urlClass) return true;

	if (!(href     in url)) return false;
	if (!(protocol in url)) return false;
	if (!(username in url)) return false;
	if (!(password in url)) return false;
	if (!(hostname in url)) return false;
	if (!(port     in url)) return false;
	if (!(host     in url)) return false;
	if (!(pathname in url)) return false;
	if (!(search   in url)) return false;
	if (!(hash     in url)) return false;

	if (supportIncomplete !== true)
	{
		if (!isObject(url.searchParams)) return false;

		// TODO :: write a separate isURLSearchParams ?
	}

	return true;
};



isURL$1.lenient = url =>
{
	return isURL$1(url, true);
};



var isurl$1 = isURL$1;

var tunnelAgent$1 = {};

var safeBuffer$1 = {exports: {}};

/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */

(function (module, exports) {
	/* eslint-disable node/no-deprecated-api */
	var buffer = require$$0$7;
	var Buffer = buffer.Buffer;

	// alternative to using Object.keys for old browsers
	function copyProps (src, dst) {
	  for (var key in src) {
	    dst[key] = src[key];
	  }
	}
	if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
	  module.exports = buffer;
	} else {
	  // Copy properties from require('buffer')
	  copyProps(buffer, exports);
	  exports.Buffer = SafeBuffer;
	}

	function SafeBuffer (arg, encodingOrOffset, length) {
	  return Buffer(arg, encodingOrOffset, length)
	}

	SafeBuffer.prototype = Object.create(Buffer.prototype);

	// Copy static methods from Buffer
	copyProps(Buffer, SafeBuffer);

	SafeBuffer.from = function (arg, encodingOrOffset, length) {
	  if (typeof arg === 'number') {
	    throw new TypeError('Argument must not be a number')
	  }
	  return Buffer(arg, encodingOrOffset, length)
	};

	SafeBuffer.alloc = function (size, fill, encoding) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  var buf = Buffer(size);
	  if (fill !== undefined) {
	    if (typeof encoding === 'string') {
	      buf.fill(fill, encoding);
	    } else {
	      buf.fill(fill);
	    }
	  } else {
	    buf.fill(0);
	  }
	  return buf
	};

	SafeBuffer.allocUnsafe = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return Buffer(size)
	};

	SafeBuffer.allocUnsafeSlow = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return buffer.SlowBuffer(size)
	}; 
} (safeBuffer$1, safeBuffer$1.exports));

var safeBufferExports = safeBuffer$1.exports;

var tls = require$$1$3
  , http$2 = require$$1$2
  , https$1 = require$$3$2
  , events = require$$4
  , assert$1 = require$$5
  , util$8 = require$$0$8
  , Buffer$5 = safeBufferExports.Buffer
  ;

tunnelAgent$1.httpOverHttp = httpOverHttp;
tunnelAgent$1.httpsOverHttp = httpsOverHttp;
tunnelAgent$1.httpOverHttps = httpOverHttps;
tunnelAgent$1.httpsOverHttps = httpsOverHttps;


function httpOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http$2.request;
  return agent
}

function httpsOverHttp(options) {
  var agent = new TunnelingAgent(options);
  agent.request = http$2.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent
}

function httpOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https$1.request;
  return agent
}

function httpsOverHttps(options) {
  var agent = new TunnelingAgent(options);
  agent.request = https$1.request;
  agent.createSocket = createSecureSocket;
  agent.defaultPort = 443;
  return agent
}


function TunnelingAgent(options) {
  var self = this;
  self.options = options || {};
  self.proxyOptions = self.options.proxy || {};
  self.maxSockets = self.options.maxSockets || http$2.Agent.defaultMaxSockets;
  self.requests = [];
  self.sockets = [];

  self.on('free', function onFree(socket, host, port) {
    for (var i = 0, len = self.requests.length; i < len; ++i) {
      var pending = self.requests[i];
      if (pending.host === host && pending.port === port) {
        // Detect the request to connect same origin server,
        // reuse the connection.
        self.requests.splice(i, 1);
        pending.request.onSocket(socket);
        return
      }
    }
    socket.destroy();
    self.removeSocket(socket);
  });
}
util$8.inherits(TunnelingAgent, events.EventEmitter);

TunnelingAgent.prototype.addRequest = function addRequest(req, options) {
  var self = this;

   // Legacy API: addRequest(req, host, port, path)
  if (typeof options === 'string') {
    options = {
      host: options,
      port: arguments[2],
      path: arguments[3]
    };
  }

  if (self.sockets.length >= this.maxSockets) {
    // We are over limit so we'll add it to the queue.
    self.requests.push({host: options.host, port: options.port, request: req});
    return
  }

  // If we are under maxSockets create a new one.
  self.createConnection({host: options.host, port: options.port, request: req});
};

TunnelingAgent.prototype.createConnection = function createConnection(pending) {
  var self = this;

  self.createSocket(pending, function(socket) {
    socket.on('free', onFree);
    socket.on('close', onCloseOrRemove);
    socket.on('agentRemove', onCloseOrRemove);
    pending.request.onSocket(socket);

    function onFree() {
      self.emit('free', socket, pending.host, pending.port);
    }

    function onCloseOrRemove(err) {
      self.removeSocket(socket);
      socket.removeListener('free', onFree);
      socket.removeListener('close', onCloseOrRemove);
      socket.removeListener('agentRemove', onCloseOrRemove);
    }
  });
};

TunnelingAgent.prototype.createSocket = function createSocket(options, cb) {
  var self = this;
  var placeholder = {};
  self.sockets.push(placeholder);

  var connectOptions = mergeOptions({}, self.proxyOptions,
    { method: 'CONNECT'
    , path: options.host + ':' + options.port
    , agent: false
    }
  );
  if (connectOptions.proxyAuth) {
    connectOptions.headers = connectOptions.headers || {};
    connectOptions.headers['Proxy-Authorization'] = 'Basic ' +
        Buffer$5.from(connectOptions.proxyAuth).toString('base64');
  }

  debug$1('making CONNECT request');
  var connectReq = self.request(connectOptions);
  connectReq.useChunkedEncodingByDefault = false; // for v0.6
  connectReq.once('response', onResponse); // for v0.6
  connectReq.once('upgrade', onUpgrade);   // for v0.6
  connectReq.once('connect', onConnect);   // for v0.7 or later
  connectReq.once('error', onError);
  connectReq.end();

  function onResponse(res) {
    // Very hacky. This is necessary to avoid http-parser leaks.
    res.upgrade = true;
  }

  function onUpgrade(res, socket, head) {
    // Hacky.
    process.nextTick(function() {
      onConnect(res, socket, head);
    });
  }

  function onConnect(res, socket, head) {
    connectReq.removeAllListeners();
    socket.removeAllListeners();

    if (res.statusCode === 200) {
      assert$1.equal(head.length, 0);
      debug$1('tunneling connection has established');
      self.sockets[self.sockets.indexOf(placeholder)] = socket;
      cb(socket);
    } else {
      debug$1('tunneling socket could not be established, statusCode=%d', res.statusCode);
      var error = new Error('tunneling socket could not be established, ' + 'statusCode=' + res.statusCode);
      error.code = 'ECONNRESET';
      options.request.emit('error', error);
      self.removeSocket(placeholder);
    }
  }

  function onError(cause) {
    connectReq.removeAllListeners();

    debug$1('tunneling socket could not be established, cause=%s\n', cause.message, cause.stack);
    var error = new Error('tunneling socket could not be established, ' + 'cause=' + cause.message);
    error.code = 'ECONNRESET';
    options.request.emit('error', error);
    self.removeSocket(placeholder);
  }
};

TunnelingAgent.prototype.removeSocket = function removeSocket(socket) {
  var pos = this.sockets.indexOf(socket);
  if (pos === -1) return

  this.sockets.splice(pos, 1);

  var pending = this.requests.shift();
  if (pending) {
    // If we have pending requests and a socket gets closed a new one
    // needs to be created to take over in the pool for the one that closed.
    this.createConnection(pending);
  }
};

function createSecureSocket(options, cb) {
  var self = this;
  TunnelingAgent.prototype.createSocket.call(self, options, function(socket) {
    // 0 is dummy port for v0.6
    var secureSocket = tls.connect(0, mergeOptions({}, self.options,
      { servername: options.host
      , socket: socket
      }
    ));
    self.sockets[self.sockets.indexOf(socket)] = secureSocket;
    cb(secureSocket);
  });
}


function mergeOptions(target) {
  for (var i = 1, len = arguments.length; i < len; ++i) {
    var overrides = arguments[i];
    if (typeof overrides === 'object') {
      var keys = Object.keys(overrides);
      for (var j = 0, keyLen = keys.length; j < keyLen; ++j) {
        var k = keys[j];
        if (overrides[k] !== undefined) {
          target[k] = overrides[k];
        }
      }
    }
  }
  return target
}


var debug$1;
if (process.env.NODE_DEBUG && /\btunnel\b/.test(process.env.NODE_DEBUG)) {
  debug$1 = function() {
    var args = Array.prototype.slice.call(arguments);
    if (typeof args[0] === 'string') {
      args[0] = 'TUNNEL: ' + args[0];
    } else {
      args.unshift('TUNNEL:');
    }
    console.error.apply(console, args);
  };
} else {
  debug$1 = function() {};
}
tunnelAgent$1.debug = debug$1; // for test

// Copied from https://github.com/nodejs/node/blob/master/lib/internal/url.js

function urlToOptions$2(url) {
  var options = {
    protocol: url.protocol,
    hostname: url.hostname,
    hash: url.hash,
    search: url.search,
    pathname: url.pathname,
    path: `${url.pathname}${url.search}`,
    href: url.href
  };
  if (url.port !== '') {
    options.port = Number(url.port);
  }
  if (url.username || url.password) {
    options.auth = `${url.username}:${url.password}`;
  }
  return options;
}



var urlToOptions_1 = urlToOptions$2;

const url$3 = require$$0$4;
const getProxy = getProxy$1;
const isurl = isurl$1;
const tunnelAgent = tunnelAgent$1;
const urlToOptions$1 = urlToOptions_1;

var caw$1 = (proxy, opts) => {
	proxy = proxy || getProxy();
	opts = Object.assign({}, opts);

	if (typeof proxy === 'object') {
		opts = proxy;
		proxy = getProxy();
	}

	if (!proxy) {
		return null;
	}

	proxy = isurl.lenient(proxy) ? urlToOptions$1(proxy) : url$3.parse(proxy);

	const uriProtocol = opts.protocol === 'https' ? 'https' : 'http';
	const proxyProtocol = proxy.protocol === 'https:' ? 'Https' : 'Http';
	const port = proxy.port || (proxyProtocol === 'Https' ? 443 : 80);
	const method = `${uriProtocol}Over${proxyProtocol}`;

	delete opts.protocol;

	return tunnelAgent[method](Object.assign({
		proxy: {
			port,
			host: proxy.hostname,
			proxyAuth: proxy.auth
		}
	}, opts));
};

var contentDisposition$2 = {exports: {}};

/*!
 * content-disposition
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

contentDisposition$2.exports = contentDisposition$1;
contentDisposition$2.exports.parse = parse$1;

/**
 * Module dependencies.
 * @private
 */

var basename = require$$1$1.basename;
var Buffer$4 = safeBufferExports.Buffer;

/**
 * RegExp to match non attr-char, *after* encodeURIComponent (i.e. not including "%")
 * @private
 */

var ENCODE_URL_ATTR_CHAR_REGEXP = /[\x00-\x20"'()*,/:;<=>?@[\\\]{}\x7f]/g; // eslint-disable-line no-control-regex

/**
 * RegExp to match percent encoding escape.
 * @private
 */

var HEX_ESCAPE_REGEXP = /%[0-9A-Fa-f]{2}/;
var HEX_ESCAPE_REPLACE_REGEXP = /%([0-9A-Fa-f]{2})/g;

/**
 * RegExp to match non-latin1 characters.
 * @private
 */

var NON_LATIN1_REGEXP = /[^\x20-\x7e\xa0-\xff]/g;

/**
 * RegExp to match quoted-pair in RFC 2616
 *
 * quoted-pair = "\" CHAR
 * CHAR        = <any US-ASCII character (octets 0 - 127)>
 * @private
 */

var QESC_REGEXP = /\\([\u0000-\u007f])/g; // eslint-disable-line no-control-regex

/**
 * RegExp to match chars that must be quoted-pair in RFC 2616
 * @private
 */

var QUOTE_REGEXP = /([\\"])/g;

/**
 * RegExp for various RFC 2616 grammar
 *
 * parameter     = token "=" ( token | quoted-string )
 * token         = 1*<any CHAR except CTLs or separators>
 * separators    = "(" | ")" | "<" | ">" | "@"
 *               | "," | ";" | ":" | "\" | <">
 *               | "/" | "[" | "]" | "?" | "="
 *               | "{" | "}" | SP | HT
 * quoted-string = ( <"> *(qdtext | quoted-pair ) <"> )
 * qdtext        = <any TEXT except <">>
 * quoted-pair   = "\" CHAR
 * CHAR          = <any US-ASCII character (octets 0 - 127)>
 * TEXT          = <any OCTET except CTLs, but including LWS>
 * LWS           = [CRLF] 1*( SP | HT )
 * CRLF          = CR LF
 * CR            = <US-ASCII CR, carriage return (13)>
 * LF            = <US-ASCII LF, linefeed (10)>
 * SP            = <US-ASCII SP, space (32)>
 * HT            = <US-ASCII HT, horizontal-tab (9)>
 * CTL           = <any US-ASCII control character (octets 0 - 31) and DEL (127)>
 * OCTET         = <any 8-bit sequence of data>
 * @private
 */

var PARAM_REGEXP = /;[\x09\x20]*([!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*=[\x09\x20]*("(?:[\x20!\x23-\x5b\x5d-\x7e\x80-\xff]|\\[\x20-\x7e])*"|[!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*/g; // eslint-disable-line no-control-regex
var TEXT_REGEXP = /^[\x20-\x7e\x80-\xff]+$/;
var TOKEN_REGEXP = /^[!#$%&'*+.0-9A-Z^_`a-z|~-]+$/;

/**
 * RegExp for various RFC 5987 grammar
 *
 * ext-value     = charset  "'" [ language ] "'" value-chars
 * charset       = "UTF-8" / "ISO-8859-1" / mime-charset
 * mime-charset  = 1*mime-charsetc
 * mime-charsetc = ALPHA / DIGIT
 *               / "!" / "#" / "$" / "%" / "&"
 *               / "+" / "-" / "^" / "_" / "`"
 *               / "{" / "}" / "~"
 * language      = ( 2*3ALPHA [ extlang ] )
 *               / 4ALPHA
 *               / 5*8ALPHA
 * extlang       = *3( "-" 3ALPHA )
 * value-chars   = *( pct-encoded / attr-char )
 * pct-encoded   = "%" HEXDIG HEXDIG
 * attr-char     = ALPHA / DIGIT
 *               / "!" / "#" / "$" / "&" / "+" / "-" / "."
 *               / "^" / "_" / "`" / "|" / "~"
 * @private
 */

var EXT_VALUE_REGEXP = /^([A-Za-z0-9!#$%&+\-^_`{}~]+)'(?:[A-Za-z]{2,3}(?:-[A-Za-z]{3}){0,3}|[A-Za-z]{4,8}|)'((?:%[0-9A-Fa-f]{2}|[A-Za-z0-9!#$&+.^_`|~-])+)$/;

/**
 * RegExp for various RFC 6266 grammar
 *
 * disposition-type = "inline" | "attachment" | disp-ext-type
 * disp-ext-type    = token
 * disposition-parm = filename-parm | disp-ext-parm
 * filename-parm    = "filename" "=" value
 *                  | "filename*" "=" ext-value
 * disp-ext-parm    = token "=" value
 *                  | ext-token "=" ext-value
 * ext-token        = <the characters in token, followed by "*">
 * @private
 */

var DISPOSITION_TYPE_REGEXP = /^([!#$%&'*+.0-9A-Z^_`a-z|~-]+)[\x09\x20]*(?:$|;)/; // eslint-disable-line no-control-regex

/**
 * Create an attachment Content-Disposition header.
 *
 * @param {string} [filename]
 * @param {object} [options]
 * @param {string} [options.type=attachment]
 * @param {string|boolean} [options.fallback=true]
 * @return {string}
 * @public
 */

function contentDisposition$1 (filename, options) {
  var opts = options || {};

  // get type
  var type = opts.type || 'attachment';

  // get parameters
  var params = createparams(filename, opts.fallback);

  // format into string
  return format$1(new ContentDisposition(type, params))
}

/**
 * Create parameters object from filename and fallback.
 *
 * @param {string} [filename]
 * @param {string|boolean} [fallback=true]
 * @return {object}
 * @private
 */

function createparams (filename, fallback) {
  if (filename === undefined) {
    return
  }

  var params = {};

  if (typeof filename !== 'string') {
    throw new TypeError('filename must be a string')
  }

  // fallback defaults to true
  if (fallback === undefined) {
    fallback = true;
  }

  if (typeof fallback !== 'string' && typeof fallback !== 'boolean') {
    throw new TypeError('fallback must be a string or boolean')
  }

  if (typeof fallback === 'string' && NON_LATIN1_REGEXP.test(fallback)) {
    throw new TypeError('fallback must be ISO-8859-1 string')
  }

  // restrict to file base name
  var name = basename(filename);

  // determine if name is suitable for quoted string
  var isQuotedString = TEXT_REGEXP.test(name);

  // generate fallback name
  var fallbackName = typeof fallback !== 'string'
    ? fallback && getlatin1(name)
    : basename(fallback);
  var hasFallback = typeof fallbackName === 'string' && fallbackName !== name;

  // set extended filename parameter
  if (hasFallback || !isQuotedString || HEX_ESCAPE_REGEXP.test(name)) {
    params['filename*'] = name;
  }

  // set filename parameter
  if (isQuotedString || hasFallback) {
    params.filename = hasFallback
      ? fallbackName
      : name;
  }

  return params
}

/**
 * Format object to Content-Disposition header.
 *
 * @param {object} obj
 * @param {string} obj.type
 * @param {object} [obj.parameters]
 * @return {string}
 * @private
 */

function format$1 (obj) {
  var parameters = obj.parameters;
  var type = obj.type;

  if (!type || typeof type !== 'string' || !TOKEN_REGEXP.test(type)) {
    throw new TypeError('invalid type')
  }

  // start with normalized type
  var string = String(type).toLowerCase();

  // append parameters
  if (parameters && typeof parameters === 'object') {
    var param;
    var params = Object.keys(parameters).sort();

    for (var i = 0; i < params.length; i++) {
      param = params[i];

      var val = param.substr(-1) === '*'
        ? ustring(parameters[param])
        : qstring(parameters[param]);

      string += '; ' + param + '=' + val;
    }
  }

  return string
}

/**
 * Decode a RFC 5987 field value (gracefully).
 *
 * @param {string} str
 * @return {string}
 * @private
 */

function decodefield (str) {
  var match = EXT_VALUE_REGEXP.exec(str);

  if (!match) {
    throw new TypeError('invalid extended field value')
  }

  var charset = match[1].toLowerCase();
  var encoded = match[2];
  var value;

  // to binary string
  var binary = encoded.replace(HEX_ESCAPE_REPLACE_REGEXP, pdecode);

  switch (charset) {
    case 'iso-8859-1':
      value = getlatin1(binary);
      break
    case 'utf-8':
      value = Buffer$4.from(binary, 'binary').toString('utf8');
      break
    default:
      throw new TypeError('unsupported charset in extended field')
  }

  return value
}

/**
 * Get ISO-8859-1 version of string.
 *
 * @param {string} val
 * @return {string}
 * @private
 */

function getlatin1 (val) {
  // simple Unicode -> ISO-8859-1 transformation
  return String(val).replace(NON_LATIN1_REGEXP, '?')
}

/**
 * Parse Content-Disposition header string.
 *
 * @param {string} string
 * @return {object}
 * @public
 */

function parse$1 (string) {
  if (!string || typeof string !== 'string') {
    throw new TypeError('argument string is required')
  }

  var match = DISPOSITION_TYPE_REGEXP.exec(string);

  if (!match) {
    throw new TypeError('invalid type format')
  }

  // normalize type
  var index = match[0].length;
  var type = match[1].toLowerCase();

  var key;
  var names = [];
  var params = {};
  var value;

  // calculate index to start at
  index = PARAM_REGEXP.lastIndex = match[0].substr(-1) === ';'
    ? index - 1
    : index;

  // match parameters
  while ((match = PARAM_REGEXP.exec(string))) {
    if (match.index !== index) {
      throw new TypeError('invalid parameter format')
    }

    index += match[0].length;
    key = match[1].toLowerCase();
    value = match[2];

    if (names.indexOf(key) !== -1) {
      throw new TypeError('invalid duplicate parameter')
    }

    names.push(key);

    if (key.indexOf('*') + 1 === key.length) {
      // decode extended value
      key = key.slice(0, -1);
      value = decodefield(value);

      // overwrite existing value
      params[key] = value;
      continue
    }

    if (typeof params[key] === 'string') {
      continue
    }

    if (value[0] === '"') {
      // remove quotes and escapes
      value = value
        .substr(1, value.length - 2)
        .replace(QESC_REGEXP, '$1');
    }

    params[key] = value;
  }

  if (index !== -1 && index !== string.length) {
    throw new TypeError('invalid parameter format')
  }

  return new ContentDisposition(type, params)
}

/**
 * Percent decode a single character.
 *
 * @param {string} str
 * @param {string} hex
 * @return {string}
 * @private
 */

function pdecode (str, hex) {
  return String.fromCharCode(parseInt(hex, 16))
}

/**
 * Percent encode a single character.
 *
 * @param {string} char
 * @return {string}
 * @private
 */

function pencode (char) {
  return '%' + String(char)
    .charCodeAt(0)
    .toString(16)
    .toUpperCase()
}

/**
 * Quote a string for HTTP.
 *
 * @param {string} val
 * @return {string}
 * @private
 */

function qstring (val) {
  var str = String(val);

  return '"' + str.replace(QUOTE_REGEXP, '\\$1') + '"'
}

/**
 * Encode a Unicode string for HTTP (RFC 5987).
 *
 * @param {string} val
 * @return {string}
 * @private
 */

function ustring (val) {
  var str = String(val);

  // percent encode as UTF-8
  var encoded = encodeURIComponent(str)
    .replace(ENCODE_URL_ATTR_CHAR_REGEXP, pencode);

  return 'UTF-8\'\'' + encoded
}

/**
 * Class for parsed Content-Disposition header for v8 optimization
 *
 * @public
 * @param {string} type
 * @param {object} parameters
 * @constructor
 */

function ContentDisposition (type, parameters) {
  this.type = type;
  this.parameters = parameters;
}

var contentDispositionExports = contentDisposition$2.exports;

var fileType$a = input => {
	const buf = new Uint8Array(input);

	if (!(buf && buf.length > 1)) {
		return null;
	}

	const check = (header, opts) => {
		opts = Object.assign({
			offset: 0
		}, opts);

		for (let i = 0; i < header.length; i++) {
			if (header[i] !== buf[i + opts.offset]) {
				return false;
			}
		}

		return true;
	};

	if (check([0xFF, 0xD8, 0xFF])) {
		return {
			ext: 'jpg',
			mime: 'image/jpeg'
		};
	}

	if (check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
		return {
			ext: 'png',
			mime: 'image/png'
		};
	}

	if (check([0x47, 0x49, 0x46])) {
		return {
			ext: 'gif',
			mime: 'image/gif'
		};
	}

	if (check([0x57, 0x45, 0x42, 0x50], {offset: 8})) {
		return {
			ext: 'webp',
			mime: 'image/webp'
		};
	}

	if (check([0x46, 0x4C, 0x49, 0x46])) {
		return {
			ext: 'flif',
			mime: 'image/flif'
		};
	}

	// Needs to be before `tif` check
	if (
		(check([0x49, 0x49, 0x2A, 0x0]) || check([0x4D, 0x4D, 0x0, 0x2A])) &&
		check([0x43, 0x52], {offset: 8})
	) {
		return {
			ext: 'cr2',
			mime: 'image/x-canon-cr2'
		};
	}

	if (
		check([0x49, 0x49, 0x2A, 0x0]) ||
		check([0x4D, 0x4D, 0x0, 0x2A])
	) {
		return {
			ext: 'tif',
			mime: 'image/tiff'
		};
	}

	if (check([0x42, 0x4D])) {
		return {
			ext: 'bmp',
			mime: 'image/bmp'
		};
	}

	if (check([0x49, 0x49, 0xBC])) {
		return {
			ext: 'jxr',
			mime: 'image/vnd.ms-photo'
		};
	}

	if (check([0x38, 0x42, 0x50, 0x53])) {
		return {
			ext: 'psd',
			mime: 'image/vnd.adobe.photoshop'
		};
	}

	// Needs to be before the `zip` check
	if (
		check([0x50, 0x4B, 0x3, 0x4]) &&
		check([0x6D, 0x69, 0x6D, 0x65, 0x74, 0x79, 0x70, 0x65, 0x61, 0x70, 0x70, 0x6C, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6F, 0x6E, 0x2F, 0x65, 0x70, 0x75, 0x62, 0x2B, 0x7A, 0x69, 0x70], {offset: 30})
	) {
		return {
			ext: 'epub',
			mime: 'application/epub+zip'
		};
	}

	// Needs to be before `zip` check
	// Assumes signed `.xpi` from addons.mozilla.org
	if (
		check([0x50, 0x4B, 0x3, 0x4]) &&
		check([0x4D, 0x45, 0x54, 0x41, 0x2D, 0x49, 0x4E, 0x46, 0x2F, 0x6D, 0x6F, 0x7A, 0x69, 0x6C, 0x6C, 0x61, 0x2E, 0x72, 0x73, 0x61], {offset: 30})
	) {
		return {
			ext: 'xpi',
			mime: 'application/x-xpinstall'
		};
	}

	if (
		check([0x50, 0x4B]) &&
		(buf[2] === 0x3 || buf[2] === 0x5 || buf[2] === 0x7) &&
		(buf[3] === 0x4 || buf[3] === 0x6 || buf[3] === 0x8)
	) {
		return {
			ext: 'zip',
			mime: 'application/zip'
		};
	}

	if (check([0x75, 0x73, 0x74, 0x61, 0x72], {offset: 257})) {
		return {
			ext: 'tar',
			mime: 'application/x-tar'
		};
	}

	if (
		check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x7]) &&
		(buf[6] === 0x0 || buf[6] === 0x1)
	) {
		return {
			ext: 'rar',
			mime: 'application/x-rar-compressed'
		};
	}

	if (check([0x1F, 0x8B, 0x8])) {
		return {
			ext: 'gz',
			mime: 'application/gzip'
		};
	}

	if (check([0x42, 0x5A, 0x68])) {
		return {
			ext: 'bz2',
			mime: 'application/x-bzip2'
		};
	}

	if (check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C])) {
		return {
			ext: '7z',
			mime: 'application/x-7z-compressed'
		};
	}

	if (check([0x78, 0x01])) {
		return {
			ext: 'dmg',
			mime: 'application/x-apple-diskimage'
		};
	}

	if (
		(
			check([0x0, 0x0, 0x0]) &&
			(buf[3] === 0x18 || buf[3] === 0x20) &&
			check([0x66, 0x74, 0x79, 0x70], {offset: 4})
		) ||
		check([0x33, 0x67, 0x70, 0x35]) ||
		(
			check([0x0, 0x0, 0x0, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x6D, 0x70, 0x34, 0x32]) &&
			check([0x6D, 0x70, 0x34, 0x31, 0x6D, 0x70, 0x34, 0x32, 0x69, 0x73, 0x6F, 0x6D], {offset: 16})
		) ||
		check([0x0, 0x0, 0x0, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D]) ||
		check([0x0, 0x0, 0x0, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x6D, 0x70, 0x34, 0x32, 0x0, 0x0, 0x0, 0x0])
	) {
		return {
			ext: 'mp4',
			mime: 'video/mp4'
		};
	}

	if (check([0x0, 0x0, 0x0, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x56])) {
		return {
			ext: 'm4v',
			mime: 'video/x-m4v'
		};
	}

	if (check([0x4D, 0x54, 0x68, 0x64])) {
		return {
			ext: 'mid',
			mime: 'audio/midi'
		};
	}

	// https://github.com/threatstack/libmagic/blob/master/magic/Magdir/matroska
	if (check([0x1A, 0x45, 0xDF, 0xA3])) {
		const sliced = buf.subarray(4, 4 + 4096);
		const idPos = sliced.findIndex((el, i, arr) => arr[i] === 0x42 && arr[i + 1] === 0x82);

		if (idPos >= 0) {
			const docTypePos = idPos + 3;
			const findDocType = type => Array.from(type).every((c, i) => sliced[docTypePos + i] === c.charCodeAt(0));

			if (findDocType('matroska')) {
				return {
					ext: 'mkv',
					mime: 'video/x-matroska'
				};
			}

			if (findDocType('webm')) {
				return {
					ext: 'webm',
					mime: 'video/webm'
				};
			}
		}
	}

	if (check([0x0, 0x0, 0x0, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20]) ||
		check([0x66, 0x72, 0x65, 0x65], {offset: 4}) ||
		check([0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20], {offset: 4}) ||
		check([0x6D, 0x64, 0x61, 0x74], {offset: 4}) || // MJPEG
		check([0x77, 0x69, 0x64, 0x65], {offset: 4})) {
		return {
			ext: 'mov',
			mime: 'video/quicktime'
		};
	}

	if (
		check([0x52, 0x49, 0x46, 0x46]) &&
		check([0x41, 0x56, 0x49], {offset: 8})
	) {
		return {
			ext: 'avi',
			mime: 'video/x-msvideo'
		};
	}

	if (check([0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9])) {
		return {
			ext: 'wmv',
			mime: 'video/x-ms-wmv'
		};
	}

	if (check([0x0, 0x0, 0x1, 0xBA])) {
		return {
			ext: 'mpg',
			mime: 'video/mpeg'
		};
	}

	if (
		check([0x49, 0x44, 0x33]) ||
		check([0xFF, 0xFB])
	) {
		return {
			ext: 'mp3',
			mime: 'audio/mpeg'
		};
	}

	if (
		check([0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x41], {offset: 4}) ||
		check([0x4D, 0x34, 0x41, 0x20])
	) {
		return {
			ext: 'm4a',
			mime: 'audio/m4a'
		};
	}

	// Needs to be before `ogg` check
	if (check([0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64], {offset: 28})) {
		return {
			ext: 'opus',
			mime: 'audio/opus'
		};
	}

	if (check([0x4F, 0x67, 0x67, 0x53])) {
		return {
			ext: 'ogg',
			mime: 'audio/ogg'
		};
	}

	if (check([0x66, 0x4C, 0x61, 0x43])) {
		return {
			ext: 'flac',
			mime: 'audio/x-flac'
		};
	}

	if (
		check([0x52, 0x49, 0x46, 0x46]) &&
		check([0x57, 0x41, 0x56, 0x45], {offset: 8})
	) {
		return {
			ext: 'wav',
			mime: 'audio/x-wav'
		};
	}

	if (check([0x23, 0x21, 0x41, 0x4D, 0x52, 0x0A])) {
		return {
			ext: 'amr',
			mime: 'audio/amr'
		};
	}

	if (check([0x25, 0x50, 0x44, 0x46])) {
		return {
			ext: 'pdf',
			mime: 'application/pdf'
		};
	}

	if (check([0x4D, 0x5A])) {
		return {
			ext: 'exe',
			mime: 'application/x-msdownload'
		};
	}

	if (
		(buf[0] === 0x43 || buf[0] === 0x46) &&
		check([0x57, 0x53], {offset: 1})
	) {
		return {
			ext: 'swf',
			mime: 'application/x-shockwave-flash'
		};
	}

	if (check([0x7B, 0x5C, 0x72, 0x74, 0x66])) {
		return {
			ext: 'rtf',
			mime: 'application/rtf'
		};
	}

	if (check([0x00, 0x61, 0x73, 0x6D])) {
		return {
			ext: 'wasm',
			mime: 'application/wasm'
		};
	}

	if (
		check([0x77, 0x4F, 0x46, 0x46]) &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			check([0x4F, 0x54, 0x54, 0x4F], {offset: 4})
		)
	) {
		return {
			ext: 'woff',
			mime: 'application/font-woff'
		};
	}

	if (
		check([0x77, 0x4F, 0x46, 0x32]) &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			check([0x4F, 0x54, 0x54, 0x4F], {offset: 4})
		)
	) {
		return {
			ext: 'woff2',
			mime: 'application/font-woff'
		};
	}

	if (
		check([0x4C, 0x50], {offset: 34}) &&
		(
			check([0x00, 0x00, 0x01], {offset: 8}) ||
			check([0x01, 0x00, 0x02], {offset: 8}) ||
			check([0x02, 0x00, 0x02], {offset: 8})
		)
	) {
		return {
			ext: 'eot',
			mime: 'application/octet-stream'
		};
	}

	if (check([0x00, 0x01, 0x00, 0x00, 0x00])) {
		return {
			ext: 'ttf',
			mime: 'application/font-sfnt'
		};
	}

	if (check([0x4F, 0x54, 0x54, 0x4F, 0x00])) {
		return {
			ext: 'otf',
			mime: 'application/font-sfnt'
		};
	}

	if (check([0x00, 0x00, 0x01, 0x00])) {
		return {
			ext: 'ico',
			mime: 'image/x-icon'
		};
	}

	if (check([0x46, 0x4C, 0x56, 0x01])) {
		return {
			ext: 'flv',
			mime: 'video/x-flv'
		};
	}

	if (check([0x25, 0x21])) {
		return {
			ext: 'ps',
			mime: 'application/postscript'
		};
	}

	if (check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00])) {
		return {
			ext: 'xz',
			mime: 'application/x-xz'
		};
	}

	if (check([0x53, 0x51, 0x4C, 0x69])) {
		return {
			ext: 'sqlite',
			mime: 'application/x-sqlite3'
		};
	}

	if (check([0x4E, 0x45, 0x53, 0x1A])) {
		return {
			ext: 'nes',
			mime: 'application/x-nintendo-nes-rom'
		};
	}

	if (check([0x43, 0x72, 0x32, 0x34])) {
		return {
			ext: 'crx',
			mime: 'application/x-google-chrome-extension'
		};
	}

	if (
		check([0x4D, 0x53, 0x43, 0x46]) ||
		check([0x49, 0x53, 0x63, 0x28])
	) {
		return {
			ext: 'cab',
			mime: 'application/vnd.ms-cab-compressed'
		};
	}

	// Needs to be before `ar` check
	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E, 0x0A, 0x64, 0x65, 0x62, 0x69, 0x61, 0x6E, 0x2D, 0x62, 0x69, 0x6E, 0x61, 0x72, 0x79])) {
		return {
			ext: 'deb',
			mime: 'application/x-deb'
		};
	}

	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E])) {
		return {
			ext: 'ar',
			mime: 'application/x-unix-archive'
		};
	}

	if (check([0xED, 0xAB, 0xEE, 0xDB])) {
		return {
			ext: 'rpm',
			mime: 'application/x-rpm'
		};
	}

	if (
		check([0x1F, 0xA0]) ||
		check([0x1F, 0x9D])
	) {
		return {
			ext: 'Z',
			mime: 'application/x-compress'
		};
	}

	if (check([0x4C, 0x5A, 0x49, 0x50])) {
		return {
			ext: 'lz',
			mime: 'application/x-lzip'
		};
	}

	if (check([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
		return {
			ext: 'msi',
			mime: 'application/x-msi'
		};
	}

	if (check([0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02])) {
		return {
			ext: 'mxf',
			mime: 'application/mxf'
		};
	}

	if (check([0x42, 0x4C, 0x45, 0x4E, 0x44, 0x45, 0x52])) {
		return {
			ext: 'blend',
			mime: 'application/x-blender'
		};
	}

	return null;
};

const fileType$9 = fileType$a;

const exts = new Set([
	'7z',
	'bz2',
	'gz',
	'rar',
	'tar',
	'zip',
	'xz',
	'gz'
]);

var archiveType$1 = input => {
	const ret = fileType$9(input);
	return exts.has(ret && ret.ext) ? ret : null;
};

var constants$1 = require$$0$9;

var origCwd = process.cwd;
var cwd = null;

var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;

process.cwd = function() {
  if (!cwd)
    cwd = origCwd.call(process);
  return cwd
};
try {
  process.cwd();
} catch (er) {}

// This check is needed until node.js 12 is required
if (typeof process.chdir === 'function') {
  var chdir = process.chdir;
  process.chdir = function (d) {
    cwd = null;
    chdir.call(process, d);
  };
  if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
}

var polyfills$1 = patch$1;

function patch$1 (fs) {
  // (re-)implement some things that are known busted or missing.

  // lchmod, broken prior to 0.6.2
  // back-port the fix here.
  if (constants$1.hasOwnProperty('O_SYMLINK') &&
      process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
    patchLchmod(fs);
  }

  // lutimes implementation, or no-op
  if (!fs.lutimes) {
    patchLutimes(fs);
  }

  // https://github.com/isaacs/node-graceful-fs/issues/4
  // Chown should not fail on einval or eperm if non-root.
  // It should not fail on enosys ever, as this just indicates
  // that a fs doesn't support the intended operation.

  fs.chown = chownFix(fs.chown);
  fs.fchown = chownFix(fs.fchown);
  fs.lchown = chownFix(fs.lchown);

  fs.chmod = chmodFix(fs.chmod);
  fs.fchmod = chmodFix(fs.fchmod);
  fs.lchmod = chmodFix(fs.lchmod);

  fs.chownSync = chownFixSync(fs.chownSync);
  fs.fchownSync = chownFixSync(fs.fchownSync);
  fs.lchownSync = chownFixSync(fs.lchownSync);

  fs.chmodSync = chmodFixSync(fs.chmodSync);
  fs.fchmodSync = chmodFixSync(fs.fchmodSync);
  fs.lchmodSync = chmodFixSync(fs.lchmodSync);

  fs.stat = statFix(fs.stat);
  fs.fstat = statFix(fs.fstat);
  fs.lstat = statFix(fs.lstat);

  fs.statSync = statFixSync(fs.statSync);
  fs.fstatSync = statFixSync(fs.fstatSync);
  fs.lstatSync = statFixSync(fs.lstatSync);

  // if lchmod/lchown do not exist, then make them no-ops
  if (fs.chmod && !fs.lchmod) {
    fs.lchmod = function (path, mode, cb) {
      if (cb) process.nextTick(cb);
    };
    fs.lchmodSync = function () {};
  }
  if (fs.chown && !fs.lchown) {
    fs.lchown = function (path, uid, gid, cb) {
      if (cb) process.nextTick(cb);
    };
    fs.lchownSync = function () {};
  }

  // on Windows, A/V software can lock the directory, causing this
  // to fail with an EACCES or EPERM if the directory contains newly
  // created files.  Try again on failure, for up to 60 seconds.

  // Set the timeout this long because some Windows Anti-Virus, such as Parity
  // bit9, may lock files for up to a minute, causing npm package install
  // failures. Also, take care to yield the scheduler. Windows scheduling gives
  // CPU to a busy looping process, which can cause the program causing the lock
  // contention to be starved of CPU by node, so the contention doesn't resolve.
  if (platform === "win32") {
    fs.rename = typeof fs.rename !== 'function' ? fs.rename
    : (function (fs$rename) {
      function rename (from, to, cb) {
        var start = Date.now();
        var backoff = 0;
        fs$rename(from, to, function CB (er) {
          if (er
              && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY")
              && Date.now() - start < 60000) {
            setTimeout(function() {
              fs.stat(to, function (stater, st) {
                if (stater && stater.code === "ENOENT")
                  fs$rename(from, to, CB);
                else
                  cb(er);
              });
            }, backoff);
            if (backoff < 100)
              backoff += 10;
            return;
          }
          if (cb) cb(er);
        });
      }
      if (Object.setPrototypeOf) Object.setPrototypeOf(rename, fs$rename);
      return rename
    })(fs.rename);
  }

  // if read() returns EAGAIN, then just try it again.
  fs.read = typeof fs.read !== 'function' ? fs.read
  : (function (fs$read) {
    function read (fd, buffer, offset, length, position, callback_) {
      var callback;
      if (callback_ && typeof callback_ === 'function') {
        var eagCounter = 0;
        callback = function (er, _, __) {
          if (er && er.code === 'EAGAIN' && eagCounter < 10) {
            eagCounter ++;
            return fs$read.call(fs, fd, buffer, offset, length, position, callback)
          }
          callback_.apply(this, arguments);
        };
      }
      return fs$read.call(fs, fd, buffer, offset, length, position, callback)
    }

    // This ensures `util.promisify` works as it does for native `fs.read`.
    if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
    return read
  })(fs.read);

  fs.readSync = typeof fs.readSync !== 'function' ? fs.readSync
  : (function (fs$readSync) { return function (fd, buffer, offset, length, position) {
    var eagCounter = 0;
    while (true) {
      try {
        return fs$readSync.call(fs, fd, buffer, offset, length, position)
      } catch (er) {
        if (er.code === 'EAGAIN' && eagCounter < 10) {
          eagCounter ++;
          continue
        }
        throw er
      }
    }
  }})(fs.readSync);

  function patchLchmod (fs) {
    fs.lchmod = function (path, mode, callback) {
      fs.open( path
             , constants$1.O_WRONLY | constants$1.O_SYMLINK
             , mode
             , function (err, fd) {
        if (err) {
          if (callback) callback(err);
          return
        }
        // prefer to return the chmod error, if one occurs,
        // but still try to close, and report closing errors if they occur.
        fs.fchmod(fd, mode, function (err) {
          fs.close(fd, function(err2) {
            if (callback) callback(err || err2);
          });
        });
      });
    };

    fs.lchmodSync = function (path, mode) {
      var fd = fs.openSync(path, constants$1.O_WRONLY | constants$1.O_SYMLINK, mode);

      // prefer to return the chmod error, if one occurs,
      // but still try to close, and report closing errors if they occur.
      var threw = true;
      var ret;
      try {
        ret = fs.fchmodSync(fd, mode);
        threw = false;
      } finally {
        if (threw) {
          try {
            fs.closeSync(fd);
          } catch (er) {}
        } else {
          fs.closeSync(fd);
        }
      }
      return ret
    };
  }

  function patchLutimes (fs) {
    if (constants$1.hasOwnProperty("O_SYMLINK") && fs.futimes) {
      fs.lutimes = function (path, at, mt, cb) {
        fs.open(path, constants$1.O_SYMLINK, function (er, fd) {
          if (er) {
            if (cb) cb(er);
            return
          }
          fs.futimes(fd, at, mt, function (er) {
            fs.close(fd, function (er2) {
              if (cb) cb(er || er2);
            });
          });
        });
      };

      fs.lutimesSync = function (path, at, mt) {
        var fd = fs.openSync(path, constants$1.O_SYMLINK);
        var ret;
        var threw = true;
        try {
          ret = fs.futimesSync(fd, at, mt);
          threw = false;
        } finally {
          if (threw) {
            try {
              fs.closeSync(fd);
            } catch (er) {}
          } else {
            fs.closeSync(fd);
          }
        }
        return ret
      };

    } else if (fs.futimes) {
      fs.lutimes = function (_a, _b, _c, cb) { if (cb) process.nextTick(cb); };
      fs.lutimesSync = function () {};
    }
  }

  function chmodFix (orig) {
    if (!orig) return orig
    return function (target, mode, cb) {
      return orig.call(fs, target, mode, function (er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      })
    }
  }

  function chmodFixSync (orig) {
    if (!orig) return orig
    return function (target, mode) {
      try {
        return orig.call(fs, target, mode)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }


  function chownFix (orig) {
    if (!orig) return orig
    return function (target, uid, gid, cb) {
      return orig.call(fs, target, uid, gid, function (er) {
        if (chownErOk(er)) er = null;
        if (cb) cb.apply(this, arguments);
      })
    }
  }

  function chownFixSync (orig) {
    if (!orig) return orig
    return function (target, uid, gid) {
      try {
        return orig.call(fs, target, uid, gid)
      } catch (er) {
        if (!chownErOk(er)) throw er
      }
    }
  }

  function statFix (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options, cb) {
      if (typeof options === 'function') {
        cb = options;
        options = null;
      }
      function callback (er, stats) {
        if (stats) {
          if (stats.uid < 0) stats.uid += 0x100000000;
          if (stats.gid < 0) stats.gid += 0x100000000;
        }
        if (cb) cb.apply(this, arguments);
      }
      return options ? orig.call(fs, target, options, callback)
        : orig.call(fs, target, callback)
    }
  }

  function statFixSync (orig) {
    if (!orig) return orig
    // Older versions of Node erroneously returned signed integers for
    // uid + gid.
    return function (target, options) {
      var stats = options ? orig.call(fs, target, options)
        : orig.call(fs, target);
      if (stats) {
        if (stats.uid < 0) stats.uid += 0x100000000;
        if (stats.gid < 0) stats.gid += 0x100000000;
      }
      return stats;
    }
  }

  // ENOSYS means that the fs doesn't support the op. Just ignore
  // that, because it doesn't matter.
  //
  // if there's no getuid, or if getuid() is something other
  // than 0, and the error is EINVAL or EPERM, then just ignore
  // it.
  //
  // This specific case is a silent failure in cp, install, tar,
  // and most other unix tools that manage permissions.
  //
  // When running as root, or if other types of errors are
  // encountered, then it's strict.
  function chownErOk (er) {
    if (!er)
      return true

    if (er.code === "ENOSYS")
      return true

    var nonroot = !process.getuid || process.getuid() !== 0;
    if (nonroot) {
      if (er.code === "EINVAL" || er.code === "EPERM")
        return true
    }

    return false
  }
}

var Stream$3 = require$$0$5.Stream;

var legacyStreams = legacy$1;

function legacy$1 (fs) {
  return {
    ReadStream: ReadStream,
    WriteStream: WriteStream
  }

  function ReadStream (path, options) {
    if (!(this instanceof ReadStream)) return new ReadStream(path, options);

    Stream$3.call(this);

    var self = this;

    this.path = path;
    this.fd = null;
    this.readable = true;
    this.paused = false;

    this.flags = 'r';
    this.mode = 438; /*=0666*/
    this.bufferSize = 64 * 1024;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.encoding) this.setEncoding(this.encoding);

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.end === undefined) {
        this.end = Infinity;
      } else if ('number' !== typeof this.end) {
        throw TypeError('end must be a Number');
      }

      if (this.start > this.end) {
        throw new Error('start must be <= end');
      }

      this.pos = this.start;
    }

    if (this.fd !== null) {
      process.nextTick(function() {
        self._read();
      });
      return;
    }

    fs.open(this.path, this.flags, this.mode, function (err, fd) {
      if (err) {
        self.emit('error', err);
        self.readable = false;
        return;
      }

      self.fd = fd;
      self.emit('open', fd);
      self._read();
    });
  }

  function WriteStream (path, options) {
    if (!(this instanceof WriteStream)) return new WriteStream(path, options);

    Stream$3.call(this);

    this.path = path;
    this.fd = null;
    this.writable = true;

    this.flags = 'w';
    this.encoding = 'binary';
    this.mode = 438; /*=0666*/
    this.bytesWritten = 0;

    options = options || {};

    // Mixin options into this
    var keys = Object.keys(options);
    for (var index = 0, length = keys.length; index < length; index++) {
      var key = keys[index];
      this[key] = options[key];
    }

    if (this.start !== undefined) {
      if ('number' !== typeof this.start) {
        throw TypeError('start must be a Number');
      }
      if (this.start < 0) {
        throw new Error('start must be >= zero');
      }

      this.pos = this.start;
    }

    this.busy = false;
    this._queue = [];

    if (this.fd === null) {
      this._open = fs.open;
      this._queue.push([this._open, this.path, this.flags, this.mode, undefined]);
      this.flush();
    }
  }
}

var clone_1 = clone$1;

var getPrototypeOf = Object.getPrototypeOf || function (obj) {
  return obj.__proto__
};

function clone$1 (obj) {
  if (obj === null || typeof obj !== 'object')
    return obj

  if (obj instanceof Object)
    var copy = { __proto__: getPrototypeOf(obj) };
  else
    var copy = Object.create(null);

  Object.getOwnPropertyNames(obj).forEach(function (key) {
    Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
  });

  return copy
}

var fs$7 = require$$0$3;
var polyfills = polyfills$1;
var legacy = legacyStreams;
var clone = clone_1;

var util$7 = require$$0$8;

/* istanbul ignore next - node 0.x polyfill */
var gracefulQueue;
var previousSymbol;

/* istanbul ignore else - node 0.x polyfill */
if (typeof Symbol === 'function' && typeof Symbol.for === 'function') {
  gracefulQueue = Symbol.for('graceful-fs.queue');
  // This is used in testing by future versions
  previousSymbol = Symbol.for('graceful-fs.previous');
} else {
  gracefulQueue = '___graceful-fs.queue';
  previousSymbol = '___graceful-fs.previous';
}

function noop$4 () {}

function publishQueue(context, queue) {
  Object.defineProperty(context, gracefulQueue, {
    get: function() {
      return queue
    }
  });
}

var debug = noop$4;
if (util$7.debuglog)
  debug = util$7.debuglog('gfs4');
else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ''))
  debug = function() {
    var m = util$7.format.apply(util$7, arguments);
    m = 'GFS4: ' + m.split(/\n/).join('\nGFS4: ');
    console.error(m);
  };

// Once time initialization
if (!fs$7[gracefulQueue]) {
  // This queue can be shared by multiple loaded instances
  var queue = commonjsGlobal[gracefulQueue] || [];
  publishQueue(fs$7, queue);

  // Patch fs.close/closeSync to shared queue version, because we need
  // to retry() whenever a close happens *anywhere* in the program.
  // This is essential when multiple graceful-fs instances are
  // in play at the same time.
  fs$7.close = (function (fs$close) {
    function close (fd, cb) {
      return fs$close.call(fs$7, fd, function (err) {
        // This function uses the graceful-fs shared queue
        if (!err) {
          resetQueue();
        }

        if (typeof cb === 'function')
          cb.apply(this, arguments);
      })
    }

    Object.defineProperty(close, previousSymbol, {
      value: fs$close
    });
    return close
  })(fs$7.close);

  fs$7.closeSync = (function (fs$closeSync) {
    function closeSync (fd) {
      // This function uses the graceful-fs shared queue
      fs$closeSync.apply(fs$7, arguments);
      resetQueue();
    }

    Object.defineProperty(closeSync, previousSymbol, {
      value: fs$closeSync
    });
    return closeSync
  })(fs$7.closeSync);

  if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || '')) {
    process.on('exit', function() {
      debug(fs$7[gracefulQueue]);
      require$$5.equal(fs$7[gracefulQueue].length, 0);
    });
  }
}

if (!commonjsGlobal[gracefulQueue]) {
  publishQueue(commonjsGlobal, fs$7[gracefulQueue]);
}

var gracefulFs = patch(clone(fs$7));
if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs$7.__patched) {
    gracefulFs = patch(fs$7);
    fs$7.__patched = true;
}

function patch (fs) {
  // Everything that references the open() function needs to be in here
  polyfills(fs);
  fs.gracefulify = patch;

  fs.createReadStream = createReadStream;
  fs.createWriteStream = createWriteStream;
  var fs$readFile = fs.readFile;
  fs.readFile = readFile;
  function readFile (path, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$readFile(path, options, cb)

    function go$readFile (path, options, cb, startTime) {
      return fs$readFile(path, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$readFile, [path, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$writeFile = fs.writeFile;
  fs.writeFile = writeFile;
  function writeFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$writeFile(path, data, options, cb)

    function go$writeFile (path, data, options, cb, startTime) {
      return fs$writeFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$writeFile, [path, data, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$appendFile = fs.appendFile;
  if (fs$appendFile)
    fs.appendFile = appendFile;
  function appendFile (path, data, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    return go$appendFile(path, data, options, cb)

    function go$appendFile (path, data, options, cb, startTime) {
      return fs$appendFile(path, data, options, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$appendFile, [path, data, options, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$copyFile = fs.copyFile;
  if (fs$copyFile)
    fs.copyFile = copyFile;
  function copyFile (src, dest, flags, cb) {
    if (typeof flags === 'function') {
      cb = flags;
      flags = 0;
    }
    return go$copyFile(src, dest, flags, cb)

    function go$copyFile (src, dest, flags, cb, startTime) {
      return fs$copyFile(src, dest, flags, function (err) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$copyFile, [src, dest, flags, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  var fs$readdir = fs.readdir;
  fs.readdir = readdir;
  var noReaddirOptionVersions = /^v[0-5]\./;
  function readdir (path, options, cb) {
    if (typeof options === 'function')
      cb = options, options = null;

    var go$readdir = noReaddirOptionVersions.test(process.version)
      ? function go$readdir (path, options, cb, startTime) {
        return fs$readdir(path, fs$readdirCallback(
          path, options, cb, startTime
        ))
      }
      : function go$readdir (path, options, cb, startTime) {
        return fs$readdir(path, options, fs$readdirCallback(
          path, options, cb, startTime
        ))
      };

    return go$readdir(path, options, cb)

    function fs$readdirCallback (path, options, cb, startTime) {
      return function (err, files) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([
            go$readdir,
            [path, options, cb],
            err,
            startTime || Date.now(),
            Date.now()
          ]);
        else {
          if (files && files.sort)
            files.sort();

          if (typeof cb === 'function')
            cb.call(this, err, files);
        }
      }
    }
  }

  if (process.version.substr(0, 4) === 'v0.8') {
    var legStreams = legacy(fs);
    ReadStream = legStreams.ReadStream;
    WriteStream = legStreams.WriteStream;
  }

  var fs$ReadStream = fs.ReadStream;
  if (fs$ReadStream) {
    ReadStream.prototype = Object.create(fs$ReadStream.prototype);
    ReadStream.prototype.open = ReadStream$open;
  }

  var fs$WriteStream = fs.WriteStream;
  if (fs$WriteStream) {
    WriteStream.prototype = Object.create(fs$WriteStream.prototype);
    WriteStream.prototype.open = WriteStream$open;
  }

  Object.defineProperty(fs, 'ReadStream', {
    get: function () {
      return ReadStream
    },
    set: function (val) {
      ReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(fs, 'WriteStream', {
    get: function () {
      return WriteStream
    },
    set: function (val) {
      WriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

  // legacy names
  var FileReadStream = ReadStream;
  Object.defineProperty(fs, 'FileReadStream', {
    get: function () {
      return FileReadStream
    },
    set: function (val) {
      FileReadStream = val;
    },
    enumerable: true,
    configurable: true
  });
  var FileWriteStream = WriteStream;
  Object.defineProperty(fs, 'FileWriteStream', {
    get: function () {
      return FileWriteStream
    },
    set: function (val) {
      FileWriteStream = val;
    },
    enumerable: true,
    configurable: true
  });

  function ReadStream (path, options) {
    if (this instanceof ReadStream)
      return fs$ReadStream.apply(this, arguments), this
    else
      return ReadStream.apply(Object.create(ReadStream.prototype), arguments)
  }

  function ReadStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        if (that.autoClose)
          that.destroy();

        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
        that.read();
      }
    });
  }

  function WriteStream (path, options) {
    if (this instanceof WriteStream)
      return fs$WriteStream.apply(this, arguments), this
    else
      return WriteStream.apply(Object.create(WriteStream.prototype), arguments)
  }

  function WriteStream$open () {
    var that = this;
    open(that.path, that.flags, that.mode, function (err, fd) {
      if (err) {
        that.destroy();
        that.emit('error', err);
      } else {
        that.fd = fd;
        that.emit('open', fd);
      }
    });
  }

  function createReadStream (path, options) {
    return new fs.ReadStream(path, options)
  }

  function createWriteStream (path, options) {
    return new fs.WriteStream(path, options)
  }

  var fs$open = fs.open;
  fs.open = open;
  function open (path, flags, mode, cb) {
    if (typeof mode === 'function')
      cb = mode, mode = null;

    return go$open(path, flags, mode, cb)

    function go$open (path, flags, mode, cb, startTime) {
      return fs$open(path, flags, mode, function (err, fd) {
        if (err && (err.code === 'EMFILE' || err.code === 'ENFILE'))
          enqueue([go$open, [path, flags, mode, cb], err, startTime || Date.now(), Date.now()]);
        else {
          if (typeof cb === 'function')
            cb.apply(this, arguments);
        }
      })
    }
  }

  return fs
}

function enqueue (elem) {
  debug('ENQUEUE', elem[0].name, elem[1]);
  fs$7[gracefulQueue].push(elem);
  retry();
}

// keep track of the timeout between retry() calls
var retryTimer;

// reset the startTime and lastTime to now
// this resets the start of the 60 second overall timeout as well as the
// delay between attempts so that we'll retry these jobs sooner
function resetQueue () {
  var now = Date.now();
  for (var i = 0; i < fs$7[gracefulQueue].length; ++i) {
    // entries that are only a length of 2 are from an older version, don't
    // bother modifying those since they'll be retried anyway.
    if (fs$7[gracefulQueue][i].length > 2) {
      fs$7[gracefulQueue][i][3] = now; // startTime
      fs$7[gracefulQueue][i][4] = now; // lastTime
    }
  }
  // call retry to make sure we're actively processing the queue
  retry();
}

function retry () {
  // clear the timer and remove it to help prevent unintended concurrency
  clearTimeout(retryTimer);
  retryTimer = undefined;

  if (fs$7[gracefulQueue].length === 0)
    return

  var elem = fs$7[gracefulQueue].shift();
  var fn = elem[0];
  var args = elem[1];
  // these items may be unset if they were added by an older graceful-fs
  var err = elem[2];
  var startTime = elem[3];
  var lastTime = elem[4];

  // if we don't have a startTime we have no way of knowing if we've waited
  // long enough, so go ahead and retry this item now
  if (startTime === undefined) {
    debug('RETRY', fn.name, args);
    fn.apply(null, args);
  } else if (Date.now() - startTime >= 60000) {
    // it's been more than 60 seconds total, bail now
    debug('TIMEOUT', fn.name, args);
    var cb = args.pop();
    if (typeof cb === 'function')
      cb.call(null, err);
  } else {
    // the amount of time between the last attempt and right now
    var sinceAttempt = Date.now() - lastTime;
    // the amount of time between when we first tried, and when we last tried
    // rounded up to at least 1
    var sinceStart = Math.max(lastTime - startTime, 1);
    // backoff. wait longer than the total time we've been retrying, but only
    // up to a maximum of 100ms
    var desiredDelay = Math.min(sinceStart * 1.2, 100);
    // it's been long enough since the last retry, do it again
    if (sinceAttempt >= desiredDelay) {
      debug('RETRY', fn.name, args);
      fn.apply(null, args.concat([startTime]));
    } else {
      // if we can't do this job yet, push it to the end of the queue
      // and let the next iteration check again
      fs$7[gracefulQueue].push(elem);
    }
  }

  // schedule our next run if one isn't already scheduled
  if (retryTimer === undefined) {
    retryTimer = setTimeout(retry, 0);
  }
}

var fileType$8 = input => {
	const buf = new Uint8Array(input);

	if (!(buf && buf.length > 1)) {
		return null;
	}

	const check = (header, opts) => {
		opts = Object.assign({
			offset: 0
		}, opts);

		for (let i = 0; i < header.length; i++) {
			if (header[i] !== buf[i + opts.offset]) {
				return false;
			}
		}

		return true;
	};

	if (check([0xFF, 0xD8, 0xFF])) {
		return {
			ext: 'jpg',
			mime: 'image/jpeg'
		};
	}

	if (check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
		return {
			ext: 'png',
			mime: 'image/png'
		};
	}

	if (check([0x47, 0x49, 0x46])) {
		return {
			ext: 'gif',
			mime: 'image/gif'
		};
	}

	if (check([0x57, 0x45, 0x42, 0x50], {offset: 8})) {
		return {
			ext: 'webp',
			mime: 'image/webp'
		};
	}

	if (check([0x46, 0x4C, 0x49, 0x46])) {
		return {
			ext: 'flif',
			mime: 'image/flif'
		};
	}

	// Needs to be before `tif` check
	if (
		(check([0x49, 0x49, 0x2A, 0x0]) || check([0x4D, 0x4D, 0x0, 0x2A])) &&
		check([0x43, 0x52], {offset: 8})
	) {
		return {
			ext: 'cr2',
			mime: 'image/x-canon-cr2'
		};
	}

	if (
		check([0x49, 0x49, 0x2A, 0x0]) ||
		check([0x4D, 0x4D, 0x0, 0x2A])
	) {
		return {
			ext: 'tif',
			mime: 'image/tiff'
		};
	}

	if (check([0x42, 0x4D])) {
		return {
			ext: 'bmp',
			mime: 'image/bmp'
		};
	}

	if (check([0x49, 0x49, 0xBC])) {
		return {
			ext: 'jxr',
			mime: 'image/vnd.ms-photo'
		};
	}

	if (check([0x38, 0x42, 0x50, 0x53])) {
		return {
			ext: 'psd',
			mime: 'image/vnd.adobe.photoshop'
		};
	}

	// Needs to be before the `zip` check
	if (
		check([0x50, 0x4B, 0x3, 0x4]) &&
		check([0x6D, 0x69, 0x6D, 0x65, 0x74, 0x79, 0x70, 0x65, 0x61, 0x70, 0x70, 0x6C, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6F, 0x6E, 0x2F, 0x65, 0x70, 0x75, 0x62, 0x2B, 0x7A, 0x69, 0x70], {offset: 30})
	) {
		return {
			ext: 'epub',
			mime: 'application/epub+zip'
		};
	}

	// Needs to be before `zip` check
	// Assumes signed `.xpi` from addons.mozilla.org
	if (
		check([0x50, 0x4B, 0x3, 0x4]) &&
		check([0x4D, 0x45, 0x54, 0x41, 0x2D, 0x49, 0x4E, 0x46, 0x2F, 0x6D, 0x6F, 0x7A, 0x69, 0x6C, 0x6C, 0x61, 0x2E, 0x72, 0x73, 0x61], {offset: 30})
	) {
		return {
			ext: 'xpi',
			mime: 'application/x-xpinstall'
		};
	}

	if (
		check([0x50, 0x4B]) &&
		(buf[2] === 0x3 || buf[2] === 0x5 || buf[2] === 0x7) &&
		(buf[3] === 0x4 || buf[3] === 0x6 || buf[3] === 0x8)
	) {
		return {
			ext: 'zip',
			mime: 'application/zip'
		};
	}

	if (check([0x75, 0x73, 0x74, 0x61, 0x72], {offset: 257})) {
		return {
			ext: 'tar',
			mime: 'application/x-tar'
		};
	}

	if (
		check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x7]) &&
		(buf[6] === 0x0 || buf[6] === 0x1)
	) {
		return {
			ext: 'rar',
			mime: 'application/x-rar-compressed'
		};
	}

	if (check([0x1F, 0x8B, 0x8])) {
		return {
			ext: 'gz',
			mime: 'application/gzip'
		};
	}

	if (check([0x42, 0x5A, 0x68])) {
		return {
			ext: 'bz2',
			mime: 'application/x-bzip2'
		};
	}

	if (check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C])) {
		return {
			ext: '7z',
			mime: 'application/x-7z-compressed'
		};
	}

	if (check([0x78, 0x01])) {
		return {
			ext: 'dmg',
			mime: 'application/x-apple-diskimage'
		};
	}

	if (
		(
			check([0x0, 0x0, 0x0]) &&
			(buf[3] === 0x18 || buf[3] === 0x20) &&
			check([0x66, 0x74, 0x79, 0x70], {offset: 4})
		) ||
		check([0x33, 0x67, 0x70, 0x35]) ||
		(
			check([0x0, 0x0, 0x0, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x6D, 0x70, 0x34, 0x32]) &&
			check([0x6D, 0x70, 0x34, 0x31, 0x6D, 0x70, 0x34, 0x32, 0x69, 0x73, 0x6F, 0x6D], {offset: 16})
		) ||
		check([0x0, 0x0, 0x0, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D]) ||
		check([0x0, 0x0, 0x0, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x6D, 0x70, 0x34, 0x32, 0x0, 0x0, 0x0, 0x0])
	) {
		return {
			ext: 'mp4',
			mime: 'video/mp4'
		};
	}

	if (check([0x0, 0x0, 0x0, 0x1C, 0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x56])) {
		return {
			ext: 'm4v',
			mime: 'video/x-m4v'
		};
	}

	if (check([0x4D, 0x54, 0x68, 0x64])) {
		return {
			ext: 'mid',
			mime: 'audio/midi'
		};
	}

	// https://github.com/threatstack/libmagic/blob/master/magic/Magdir/matroska
	if (check([0x1A, 0x45, 0xDF, 0xA3])) {
		const sliced = buf.subarray(4, 4 + 4096);
		const idPos = sliced.findIndex((el, i, arr) => arr[i] === 0x42 && arr[i + 1] === 0x82);

		if (idPos >= 0) {
			const docTypePos = idPos + 3;
			const findDocType = type => Array.from(type).every((c, i) => sliced[docTypePos + i] === c.charCodeAt(0));

			if (findDocType('matroska')) {
				return {
					ext: 'mkv',
					mime: 'video/x-matroska'
				};
			}

			if (findDocType('webm')) {
				return {
					ext: 'webm',
					mime: 'video/webm'
				};
			}
		}
	}

	if (check([0x0, 0x0, 0x0, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20]) ||
		check([0x66, 0x72, 0x65, 0x65], {offset: 4}) ||
		check([0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20], {offset: 4}) ||
		check([0x6D, 0x64, 0x61, 0x74], {offset: 4}) || // MJPEG
		check([0x77, 0x69, 0x64, 0x65], {offset: 4})) {
		return {
			ext: 'mov',
			mime: 'video/quicktime'
		};
	}

	if (
		check([0x52, 0x49, 0x46, 0x46]) &&
		check([0x41, 0x56, 0x49], {offset: 8})
	) {
		return {
			ext: 'avi',
			mime: 'video/x-msvideo'
		};
	}

	if (check([0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9])) {
		return {
			ext: 'wmv',
			mime: 'video/x-ms-wmv'
		};
	}

	if (check([0x0, 0x0, 0x1, 0xBA])) {
		return {
			ext: 'mpg',
			mime: 'video/mpeg'
		};
	}

	if (
		check([0x49, 0x44, 0x33]) ||
		check([0xFF, 0xFB])
	) {
		return {
			ext: 'mp3',
			mime: 'audio/mpeg'
		};
	}

	if (
		check([0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x41], {offset: 4}) ||
		check([0x4D, 0x34, 0x41, 0x20])
	) {
		return {
			ext: 'm4a',
			mime: 'audio/m4a'
		};
	}

	// Needs to be before `ogg` check
	if (check([0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64], {offset: 28})) {
		return {
			ext: 'opus',
			mime: 'audio/opus'
		};
	}

	if (check([0x4F, 0x67, 0x67, 0x53])) {
		return {
			ext: 'ogg',
			mime: 'audio/ogg'
		};
	}

	if (check([0x66, 0x4C, 0x61, 0x43])) {
		return {
			ext: 'flac',
			mime: 'audio/x-flac'
		};
	}

	if (
		check([0x52, 0x49, 0x46, 0x46]) &&
		check([0x57, 0x41, 0x56, 0x45], {offset: 8})
	) {
		return {
			ext: 'wav',
			mime: 'audio/x-wav'
		};
	}

	if (check([0x23, 0x21, 0x41, 0x4D, 0x52, 0x0A])) {
		return {
			ext: 'amr',
			mime: 'audio/amr'
		};
	}

	if (check([0x25, 0x50, 0x44, 0x46])) {
		return {
			ext: 'pdf',
			mime: 'application/pdf'
		};
	}

	if (check([0x4D, 0x5A])) {
		return {
			ext: 'exe',
			mime: 'application/x-msdownload'
		};
	}

	if (
		(buf[0] === 0x43 || buf[0] === 0x46) &&
		check([0x57, 0x53], {offset: 1})
	) {
		return {
			ext: 'swf',
			mime: 'application/x-shockwave-flash'
		};
	}

	if (check([0x7B, 0x5C, 0x72, 0x74, 0x66])) {
		return {
			ext: 'rtf',
			mime: 'application/rtf'
		};
	}

	if (check([0x00, 0x61, 0x73, 0x6D])) {
		return {
			ext: 'wasm',
			mime: 'application/wasm'
		};
	}

	if (
		check([0x77, 0x4F, 0x46, 0x46]) &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			check([0x4F, 0x54, 0x54, 0x4F], {offset: 4})
		)
	) {
		return {
			ext: 'woff',
			mime: 'font/woff'
		};
	}

	if (
		check([0x77, 0x4F, 0x46, 0x32]) &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			check([0x4F, 0x54, 0x54, 0x4F], {offset: 4})
		)
	) {
		return {
			ext: 'woff2',
			mime: 'font/woff2'
		};
	}

	if (
		check([0x4C, 0x50], {offset: 34}) &&
		(
			check([0x00, 0x00, 0x01], {offset: 8}) ||
			check([0x01, 0x00, 0x02], {offset: 8}) ||
			check([0x02, 0x00, 0x02], {offset: 8})
		)
	) {
		return {
			ext: 'eot',
			mime: 'application/octet-stream'
		};
	}

	if (check([0x00, 0x01, 0x00, 0x00, 0x00])) {
		return {
			ext: 'ttf',
			mime: 'font/ttf'
		};
	}

	if (check([0x4F, 0x54, 0x54, 0x4F, 0x00])) {
		return {
			ext: 'otf',
			mime: 'font/otf'
		};
	}

	if (check([0x00, 0x00, 0x01, 0x00])) {
		return {
			ext: 'ico',
			mime: 'image/x-icon'
		};
	}

	if (check([0x46, 0x4C, 0x56, 0x01])) {
		return {
			ext: 'flv',
			mime: 'video/x-flv'
		};
	}

	if (check([0x25, 0x21])) {
		return {
			ext: 'ps',
			mime: 'application/postscript'
		};
	}

	if (check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00])) {
		return {
			ext: 'xz',
			mime: 'application/x-xz'
		};
	}

	if (check([0x53, 0x51, 0x4C, 0x69])) {
		return {
			ext: 'sqlite',
			mime: 'application/x-sqlite3'
		};
	}

	if (check([0x4E, 0x45, 0x53, 0x1A])) {
		return {
			ext: 'nes',
			mime: 'application/x-nintendo-nes-rom'
		};
	}

	if (check([0x43, 0x72, 0x32, 0x34])) {
		return {
			ext: 'crx',
			mime: 'application/x-google-chrome-extension'
		};
	}

	if (
		check([0x4D, 0x53, 0x43, 0x46]) ||
		check([0x49, 0x53, 0x63, 0x28])
	) {
		return {
			ext: 'cab',
			mime: 'application/vnd.ms-cab-compressed'
		};
	}

	// Needs to be before `ar` check
	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E, 0x0A, 0x64, 0x65, 0x62, 0x69, 0x61, 0x6E, 0x2D, 0x62, 0x69, 0x6E, 0x61, 0x72, 0x79])) {
		return {
			ext: 'deb',
			mime: 'application/x-deb'
		};
	}

	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E])) {
		return {
			ext: 'ar',
			mime: 'application/x-unix-archive'
		};
	}

	if (check([0xED, 0xAB, 0xEE, 0xDB])) {
		return {
			ext: 'rpm',
			mime: 'application/x-rpm'
		};
	}

	if (
		check([0x1F, 0xA0]) ||
		check([0x1F, 0x9D])
	) {
		return {
			ext: 'Z',
			mime: 'application/x-compress'
		};
	}

	if (check([0x4C, 0x5A, 0x49, 0x50])) {
		return {
			ext: 'lz',
			mime: 'application/x-lzip'
		};
	}

	if (check([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
		return {
			ext: 'msi',
			mime: 'application/x-msi'
		};
	}

	if (check([0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02])) {
		return {
			ext: 'mxf',
			mime: 'application/mxf'
		};
	}

	if (check([0x47], {offset: 4}) && (check([0x47], {offset: 192}) || check([0x47], {offset: 196}))) {
		return {
			ext: 'mts',
			mime: 'video/mp2t'
		};
	}

	if (check([0x42, 0x4C, 0x45, 0x4E, 0x44, 0x45, 0x52])) {
		return {
			ext: 'blend',
			mime: 'application/x-blender'
		};
	}

	if (check([0x42, 0x50, 0x47, 0xFB])) {
		return {
			ext: 'bpg',
			mime: 'image/bpg'
		};
	}

	return null;
};

var isStream$4 = {exports: {}};

var isStream$3 = isStream$4.exports = function (stream) {
	return stream !== null && typeof stream === 'object' && typeof stream.pipe === 'function';
};

isStream$3.writable = function (stream) {
	return isStream$3(stream) && stream.writable !== false && typeof stream._write === 'function' && typeof stream._writableState === 'object';
};

isStream$3.readable = function (stream) {
	return isStream$3(stream) && stream.readable !== false && typeof stream._read === 'function' && typeof stream._readableState === 'object';
};

isStream$3.duplex = function (stream) {
	return isStream$3.writable(stream) && isStream$3.readable(stream);
};

isStream$3.transform = function (stream) {
	return isStream$3.duplex(stream) && typeof stream._transform === 'function' && typeof stream._transformState === 'object';
};

var isStreamExports = isStream$4.exports;

var tarStream$1 = {};

var readable = {exports: {}};

var processNextickArgs = {exports: {}};

var hasRequiredProcessNextickArgs;

function requireProcessNextickArgs () {
	if (hasRequiredProcessNextickArgs) return processNextickArgs.exports;
	hasRequiredProcessNextickArgs = 1;

	if (typeof process === 'undefined' ||
	    !process.version ||
	    process.version.indexOf('v0.') === 0 ||
	    process.version.indexOf('v1.') === 0 && process.version.indexOf('v1.8.') !== 0) {
	  processNextickArgs.exports = { nextTick: nextTick };
	} else {
	  processNextickArgs.exports = process;
	}

	function nextTick(fn, arg1, arg2, arg3) {
	  if (typeof fn !== 'function') {
	    throw new TypeError('"callback" argument must be a function');
	  }
	  var len = arguments.length;
	  var args, i;
	  switch (len) {
	  case 0:
	  case 1:
	    return process.nextTick(fn);
	  case 2:
	    return process.nextTick(function afterTickOne() {
	      fn.call(null, arg1);
	    });
	  case 3:
	    return process.nextTick(function afterTickTwo() {
	      fn.call(null, arg1, arg2);
	    });
	  case 4:
	    return process.nextTick(function afterTickThree() {
	      fn.call(null, arg1, arg2, arg3);
	    });
	  default:
	    args = new Array(len - 1);
	    i = 0;
	    while (i < args.length) {
	      args[i++] = arguments[i];
	    }
	    return process.nextTick(function afterTick() {
	      fn.apply(null, args);
	    });
	  }
	}
	return processNextickArgs.exports;
}

var isarray;
var hasRequiredIsarray;

function requireIsarray () {
	if (hasRequiredIsarray) return isarray;
	hasRequiredIsarray = 1;
	var toString = {}.toString;

	isarray = Array.isArray || function (arr) {
	  return toString.call(arr) == '[object Array]';
	};
	return isarray;
}

var stream$3;
var hasRequiredStream;

function requireStream () {
	if (hasRequiredStream) return stream$3;
	hasRequiredStream = 1;
	stream$3 = require$$0$5;
	return stream$3;
}

var safeBuffer = {exports: {}};

/* eslint-disable node/no-deprecated-api */

var hasRequiredSafeBuffer;

function requireSafeBuffer () {
	if (hasRequiredSafeBuffer) return safeBuffer.exports;
	hasRequiredSafeBuffer = 1;
	(function (module, exports) {
		var buffer = require$$0$7;
		var Buffer = buffer.Buffer;

		// alternative to using Object.keys for old browsers
		function copyProps (src, dst) {
		  for (var key in src) {
		    dst[key] = src[key];
		  }
		}
		if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
		  module.exports = buffer;
		} else {
		  // Copy properties from require('buffer')
		  copyProps(buffer, exports);
		  exports.Buffer = SafeBuffer;
		}

		function SafeBuffer (arg, encodingOrOffset, length) {
		  return Buffer(arg, encodingOrOffset, length)
		}

		// Copy static methods from Buffer
		copyProps(Buffer, SafeBuffer);

		SafeBuffer.from = function (arg, encodingOrOffset, length) {
		  if (typeof arg === 'number') {
		    throw new TypeError('Argument must not be a number')
		  }
		  return Buffer(arg, encodingOrOffset, length)
		};

		SafeBuffer.alloc = function (size, fill, encoding) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  var buf = Buffer(size);
		  if (fill !== undefined) {
		    if (typeof encoding === 'string') {
		      buf.fill(fill, encoding);
		    } else {
		      buf.fill(fill);
		    }
		  } else {
		    buf.fill(0);
		  }
		  return buf
		};

		SafeBuffer.allocUnsafe = function (size) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  return Buffer(size)
		};

		SafeBuffer.allocUnsafeSlow = function (size) {
		  if (typeof size !== 'number') {
		    throw new TypeError('Argument must be a number')
		  }
		  return buffer.SlowBuffer(size)
		}; 
	} (safeBuffer, safeBuffer.exports));
	return safeBuffer.exports;
}

var util$6 = {};

var hasRequiredUtil;

function requireUtil () {
	if (hasRequiredUtil) return util$6;
	hasRequiredUtil = 1;
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.

	function isArray(arg) {
	  if (Array.isArray) {
	    return Array.isArray(arg);
	  }
	  return objectToString(arg) === '[object Array]';
	}
	util$6.isArray = isArray;

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}
	util$6.isBoolean = isBoolean;

	function isNull(arg) {
	  return arg === null;
	}
	util$6.isNull = isNull;

	function isNullOrUndefined(arg) {
	  return arg == null;
	}
	util$6.isNullOrUndefined = isNullOrUndefined;

	function isNumber(arg) {
	  return typeof arg === 'number';
	}
	util$6.isNumber = isNumber;

	function isString(arg) {
	  return typeof arg === 'string';
	}
	util$6.isString = isString;

	function isSymbol(arg) {
	  return typeof arg === 'symbol';
	}
	util$6.isSymbol = isSymbol;

	function isUndefined(arg) {
	  return arg === void 0;
	}
	util$6.isUndefined = isUndefined;

	function isRegExp(re) {
	  return objectToString(re) === '[object RegExp]';
	}
	util$6.isRegExp = isRegExp;

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}
	util$6.isObject = isObject;

	function isDate(d) {
	  return objectToString(d) === '[object Date]';
	}
	util$6.isDate = isDate;

	function isError(e) {
	  return (objectToString(e) === '[object Error]' || e instanceof Error);
	}
	util$6.isError = isError;

	function isFunction(arg) {
	  return typeof arg === 'function';
	}
	util$6.isFunction = isFunction;

	function isPrimitive(arg) {
	  return arg === null ||
	         typeof arg === 'boolean' ||
	         typeof arg === 'number' ||
	         typeof arg === 'string' ||
	         typeof arg === 'symbol' ||  // ES6 symbol
	         typeof arg === 'undefined';
	}
	util$6.isPrimitive = isPrimitive;

	util$6.isBuffer = require$$0$7.Buffer.isBuffer;

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}
	return util$6;
}

var inherits$1 = {exports: {}};

var inherits_browser = {exports: {}};

var hasRequiredInherits_browser;

function requireInherits_browser () {
	if (hasRequiredInherits_browser) return inherits_browser.exports;
	hasRequiredInherits_browser = 1;
	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  inherits_browser.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      ctor.prototype = Object.create(superCtor.prototype, {
	        constructor: {
	          value: ctor,
	          enumerable: false,
	          writable: true,
	          configurable: true
	        }
	      });
	    }
	  };
	} else {
	  // old school shim for old browsers
	  inherits_browser.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      var TempCtor = function () {};
	      TempCtor.prototype = superCtor.prototype;
	      ctor.prototype = new TempCtor();
	      ctor.prototype.constructor = ctor;
	    }
	  };
	}
	return inherits_browser.exports;
}

var hasRequiredInherits;

function requireInherits () {
	if (hasRequiredInherits) return inherits$1.exports;
	hasRequiredInherits = 1;
	try {
	  var util = require('util');
	  /* istanbul ignore next */
	  if (typeof util.inherits !== 'function') throw '';
	  inherits$1.exports = util.inherits;
	} catch (e) {
	  /* istanbul ignore next */
	  inherits$1.exports = requireInherits_browser();
	}
	return inherits$1.exports;
}

var BufferList$1 = {exports: {}};

var hasRequiredBufferList;

function requireBufferList () {
	if (hasRequiredBufferList) return BufferList$1.exports;
	hasRequiredBufferList = 1;
	(function (module) {

		function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

		var Buffer = requireSafeBuffer().Buffer;
		var util = require$$0$8;

		function copyBuffer(src, target, offset) {
		  src.copy(target, offset);
		}

		module.exports = function () {
		  function BufferList() {
		    _classCallCheck(this, BufferList);

		    this.head = null;
		    this.tail = null;
		    this.length = 0;
		  }

		  BufferList.prototype.push = function push(v) {
		    var entry = { data: v, next: null };
		    if (this.length > 0) this.tail.next = entry;else this.head = entry;
		    this.tail = entry;
		    ++this.length;
		  };

		  BufferList.prototype.unshift = function unshift(v) {
		    var entry = { data: v, next: this.head };
		    if (this.length === 0) this.tail = entry;
		    this.head = entry;
		    ++this.length;
		  };

		  BufferList.prototype.shift = function shift() {
		    if (this.length === 0) return;
		    var ret = this.head.data;
		    if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
		    --this.length;
		    return ret;
		  };

		  BufferList.prototype.clear = function clear() {
		    this.head = this.tail = null;
		    this.length = 0;
		  };

		  BufferList.prototype.join = function join(s) {
		    if (this.length === 0) return '';
		    var p = this.head;
		    var ret = '' + p.data;
		    while (p = p.next) {
		      ret += s + p.data;
		    }return ret;
		  };

		  BufferList.prototype.concat = function concat(n) {
		    if (this.length === 0) return Buffer.alloc(0);
		    var ret = Buffer.allocUnsafe(n >>> 0);
		    var p = this.head;
		    var i = 0;
		    while (p) {
		      copyBuffer(p.data, ret, i);
		      i += p.data.length;
		      p = p.next;
		    }
		    return ret;
		  };

		  return BufferList;
		}();

		if (util && util.inspect && util.inspect.custom) {
		  module.exports.prototype[util.inspect.custom] = function () {
		    var obj = util.inspect({ length: this.length });
		    return this.constructor.name + ' ' + obj;
		  };
		} 
	} (BufferList$1));
	return BufferList$1.exports;
}

var destroy_1;
var hasRequiredDestroy;

function requireDestroy () {
	if (hasRequiredDestroy) return destroy_1;
	hasRequiredDestroy = 1;

	/*<replacement>*/

	var pna = requireProcessNextickArgs();
	/*</replacement>*/

	// undocumented cb() API, needed for core, not for public API
	function destroy(err, cb) {
	  var _this = this;

	  var readableDestroyed = this._readableState && this._readableState.destroyed;
	  var writableDestroyed = this._writableState && this._writableState.destroyed;

	  if (readableDestroyed || writableDestroyed) {
	    if (cb) {
	      cb(err);
	    } else if (err) {
	      if (!this._writableState) {
	        pna.nextTick(emitErrorNT, this, err);
	      } else if (!this._writableState.errorEmitted) {
	        this._writableState.errorEmitted = true;
	        pna.nextTick(emitErrorNT, this, err);
	      }
	    }

	    return this;
	  }

	  // we set destroyed to true before firing error callbacks in order
	  // to make it re-entrance safe in case destroy() is called within callbacks

	  if (this._readableState) {
	    this._readableState.destroyed = true;
	  }

	  // if this is a duplex stream mark the writable part as destroyed as well
	  if (this._writableState) {
	    this._writableState.destroyed = true;
	  }

	  this._destroy(err || null, function (err) {
	    if (!cb && err) {
	      if (!_this._writableState) {
	        pna.nextTick(emitErrorNT, _this, err);
	      } else if (!_this._writableState.errorEmitted) {
	        _this._writableState.errorEmitted = true;
	        pna.nextTick(emitErrorNT, _this, err);
	      }
	    } else if (cb) {
	      cb(err);
	    }
	  });

	  return this;
	}

	function undestroy() {
	  if (this._readableState) {
	    this._readableState.destroyed = false;
	    this._readableState.reading = false;
	    this._readableState.ended = false;
	    this._readableState.endEmitted = false;
	  }

	  if (this._writableState) {
	    this._writableState.destroyed = false;
	    this._writableState.ended = false;
	    this._writableState.ending = false;
	    this._writableState.finalCalled = false;
	    this._writableState.prefinished = false;
	    this._writableState.finished = false;
	    this._writableState.errorEmitted = false;
	  }
	}

	function emitErrorNT(self, err) {
	  self.emit('error', err);
	}

	destroy_1 = {
	  destroy: destroy,
	  undestroy: undestroy
	};
	return destroy_1;
}

var node;
var hasRequiredNode;

function requireNode () {
	if (hasRequiredNode) return node;
	hasRequiredNode = 1;
	/**
	 * For Node.js, simply re-export the core `util.deprecate` function.
	 */

	node = require$$0$8.deprecate;
	return node;
}

var _stream_writable;
var hasRequired_stream_writable;

function require_stream_writable () {
	if (hasRequired_stream_writable) return _stream_writable;
	hasRequired_stream_writable = 1;

	/*<replacement>*/

	var pna = requireProcessNextickArgs();
	/*</replacement>*/

	_stream_writable = Writable;

	// It seems a linked list but it is not
	// there will be only 2 of these for each stream
	function CorkedRequest(state) {
	  var _this = this;

	  this.next = null;
	  this.entry = null;
	  this.finish = function () {
	    onCorkedFinish(_this, state);
	  };
	}
	/* </replacement> */

	/*<replacement>*/
	var asyncWrite = !process.browser && ['v0.10', 'v0.9.'].indexOf(process.version.slice(0, 5)) > -1 ? setImmediate : pna.nextTick;
	/*</replacement>*/

	/*<replacement>*/
	var Duplex;
	/*</replacement>*/

	Writable.WritableState = WritableState;

	/*<replacement>*/
	var util = Object.create(requireUtil());
	util.inherits = requireInherits();
	/*</replacement>*/

	/*<replacement>*/
	var internalUtil = {
	  deprecate: requireNode()
	};
	/*</replacement>*/

	/*<replacement>*/
	var Stream = requireStream();
	/*</replacement>*/

	/*<replacement>*/

	var Buffer = requireSafeBuffer().Buffer;
	var OurUint8Array = (typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
	function _uint8ArrayToBuffer(chunk) {
	  return Buffer.from(chunk);
	}
	function _isUint8Array(obj) {
	  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
	}

	/*</replacement>*/

	var destroyImpl = requireDestroy();

	util.inherits(Writable, Stream);

	function nop() {}

	function WritableState(options, stream) {
	  Duplex = Duplex || require_stream_duplex();

	  options = options || {};

	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream.
	  // These options can be provided separately as readableXXX and writableXXX.
	  var isDuplex = stream instanceof Duplex;

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  var writableHwm = options.writableHighWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

	  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (writableHwm || writableHwm === 0)) this.highWaterMark = writableHwm;else this.highWaterMark = defaultHwm;

	  // cast to ints.
	  this.highWaterMark = Math.floor(this.highWaterMark);

	  // if _final has been called
	  this.finalCalled = false;

	  // drain event flag.
	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // has it been destroyed
	  this.destroyed = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function (er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.bufferedRequest = null;
	  this.lastBufferedRequest = null;

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;

	  // count buffered requests
	  this.bufferedRequestCount = 0;

	  // allocate the first CorkedRequest, there is always
	  // one allocated and free to use, and we maintain at most two
	  this.corkedRequestsFree = new CorkedRequest(this);
	}

	WritableState.prototype.getBuffer = function getBuffer() {
	  var current = this.bufferedRequest;
	  var out = [];
	  while (current) {
	    out.push(current);
	    current = current.next;
	  }
	  return out;
	};

	(function () {
	  try {
	    Object.defineProperty(WritableState.prototype, 'buffer', {
	      get: internalUtil.deprecate(function () {
	        return this.getBuffer();
	      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
	    });
	  } catch (_) {}
	})();

	// Test _writableState for inheritance to account for Duplex streams,
	// whose prototype chain only points to Readable.
	var realHasInstance;
	if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
	  realHasInstance = Function.prototype[Symbol.hasInstance];
	  Object.defineProperty(Writable, Symbol.hasInstance, {
	    value: function (object) {
	      if (realHasInstance.call(this, object)) return true;
	      if (this !== Writable) return false;

	      return object && object._writableState instanceof WritableState;
	    }
	  });
	} else {
	  realHasInstance = function (object) {
	    return object instanceof this;
	  };
	}

	function Writable(options) {
	  Duplex = Duplex || require_stream_duplex();

	  // Writable ctor is applied to Duplexes, too.
	  // `realHasInstance` is necessary because using plain `instanceof`
	  // would return false, as no `_writableState` property is attached.

	  // Trying to use the custom `instanceof` for Writable here will also break the
	  // Node.js LazyTransform implementation, which has a non-trivial getter for
	  // `_writableState` that would lead to infinite recursion.
	  if (!realHasInstance.call(Writable, this) && !(this instanceof Duplex)) {
	    return new Writable(options);
	  }

	  this._writableState = new WritableState(options, this);

	  // legacy.
	  this.writable = true;

	  if (options) {
	    if (typeof options.write === 'function') this._write = options.write;

	    if (typeof options.writev === 'function') this._writev = options.writev;

	    if (typeof options.destroy === 'function') this._destroy = options.destroy;

	    if (typeof options.final === 'function') this._final = options.final;
	  }

	  Stream.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function () {
	  this.emit('error', new Error('Cannot pipe, not readable'));
	};

	function writeAfterEnd(stream, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  pna.nextTick(cb, er);
	}

	// Checks that a user-supplied chunk is valid, especially for the particular
	// mode the stream is in. Currently this means that `null` is never accepted
	// and undefined/non-string values are only allowed in object mode.
	function validChunk(stream, state, chunk, cb) {
	  var valid = true;
	  var er = false;

	  if (chunk === null) {
	    er = new TypeError('May not write null values to stream');
	  } else if (typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  if (er) {
	    stream.emit('error', er);
	    pna.nextTick(cb, er);
	    valid = false;
	  }
	  return valid;
	}

	Writable.prototype.write = function (chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;
	  var isBuf = !state.objectMode && _isUint8Array(chunk);

	  if (isBuf && !Buffer.isBuffer(chunk)) {
	    chunk = _uint8ArrayToBuffer(chunk);
	  }

	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

	  if (typeof cb !== 'function') cb = nop;

	  if (state.ended) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
	  }

	  return ret;
	};

	Writable.prototype.cork = function () {
	  var state = this._writableState;

	  state.corked++;
	};

	Writable.prototype.uncork = function () {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;

	    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
	  }
	};

	Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
	  // node::ParseEncoding() requires lower case.
	  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
	  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
	  this._writableState.defaultEncoding = encoding;
	  return this;
	};

	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
	    chunk = Buffer.from(chunk, encoding);
	  }
	  return chunk;
	}

	Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function () {
	    return this._writableState.highWaterMark;
	  }
	});

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
	  if (!isBuf) {
	    var newChunk = decodeChunk(state, chunk, encoding);
	    if (chunk !== newChunk) {
	      isBuf = true;
	      encoding = 'buffer';
	      chunk = newChunk;
	    }
	  }
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret) state.needDrain = true;

	  if (state.writing || state.corked) {
	    var last = state.lastBufferedRequest;
	    state.lastBufferedRequest = {
	      chunk: chunk,
	      encoding: encoding,
	      isBuf: isBuf,
	      callback: cb,
	      next: null
	    };
	    if (last) {
	      last.next = state.lastBufferedRequest;
	    } else {
	      state.bufferedRequest = state.lastBufferedRequest;
	    }
	    state.bufferedRequestCount += 1;
	  } else {
	    doWrite(stream, state, false, len, chunk, encoding, cb);
	  }

	  return ret;
	}

	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	  --state.pendingcb;

	  if (sync) {
	    // defer the callback if we are being called synchronously
	    // to avoid piling up things on the stack
	    pna.nextTick(cb, er);
	    // this can emit finish, and it will always happen
	    // after error
	    pna.nextTick(finishMaybe, stream, state);
	    stream._writableState.errorEmitted = true;
	    stream.emit('error', er);
	  } else {
	    // the caller expect this to happen before if
	    // it is async
	    cb(er);
	    stream._writableState.errorEmitted = true;
	    stream.emit('error', er);
	    // this can emit finish, but finish must
	    // always follow error
	    finishMaybe(stream, state);
	  }
	}

	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate(state);

	  if (er) onwriteError(stream, state, sync, er, cb);else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(state);

	    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
	      clearBuffer(stream, state);
	    }

	    if (sync) {
	      /*<replacement>*/
	      asyncWrite(afterWrite, stream, state, finished, cb);
	      /*</replacement>*/
	    } else {
	      afterWrite(stream, state, finished, cb);
	    }
	  }
	}

	function afterWrite(stream, state, finished, cb) {
	  if (!finished) onwriteDrain(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}

	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;
	  var entry = state.bufferedRequest;

	  if (stream._writev && entry && entry.next) {
	    // Fast case, write everything using _writev()
	    var l = state.bufferedRequestCount;
	    var buffer = new Array(l);
	    var holder = state.corkedRequestsFree;
	    holder.entry = entry;

	    var count = 0;
	    var allBuffers = true;
	    while (entry) {
	      buffer[count] = entry;
	      if (!entry.isBuf) allBuffers = false;
	      entry = entry.next;
	      count += 1;
	    }
	    buffer.allBuffers = allBuffers;

	    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

	    // doWrite is almost always async, defer these to save a bit of time
	    // as the hot path ends with doWrite
	    state.pendingcb++;
	    state.lastBufferedRequest = null;
	    if (holder.next) {
	      state.corkedRequestsFree = holder.next;
	      holder.next = null;
	    } else {
	      state.corkedRequestsFree = new CorkedRequest(state);
	    }
	    state.bufferedRequestCount = 0;
	  } else {
	    // Slow case, write chunks one-by-one
	    while (entry) {
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;

	      doWrite(stream, state, false, len, chunk, encoding, cb);
	      entry = entry.next;
	      state.bufferedRequestCount--;
	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        break;
	      }
	    }

	    if (entry === null) state.lastBufferedRequest = null;
	  }

	  state.bufferedRequest = entry;
	  state.bufferProcessing = false;
	}

	Writable.prototype._write = function (chunk, encoding, cb) {
	  cb(new Error('_write() is not implemented'));
	};

	Writable.prototype._writev = null;

	Writable.prototype.end = function (chunk, encoding, cb) {
	  var state = this._writableState;

	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending) endWritable(this, state, cb);
	};

	function needFinish(state) {
	  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
	}
	function callFinal(stream, state) {
	  stream._final(function (err) {
	    state.pendingcb--;
	    if (err) {
	      stream.emit('error', err);
	    }
	    state.prefinished = true;
	    stream.emit('prefinish');
	    finishMaybe(stream, state);
	  });
	}
	function prefinish(stream, state) {
	  if (!state.prefinished && !state.finalCalled) {
	    if (typeof stream._final === 'function') {
	      state.pendingcb++;
	      state.finalCalled = true;
	      pna.nextTick(callFinal, stream, state);
	    } else {
	      state.prefinished = true;
	      stream.emit('prefinish');
	    }
	  }
	}

	function finishMaybe(stream, state) {
	  var need = needFinish(state);
	  if (need) {
	    prefinish(stream, state);
	    if (state.pendingcb === 0) {
	      state.finished = true;
	      stream.emit('finish');
	    }
	  }
	  return need;
	}

	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished) pna.nextTick(cb);else stream.once('finish', cb);
	  }
	  state.ended = true;
	  stream.writable = false;
	}

	function onCorkedFinish(corkReq, state, err) {
	  var entry = corkReq.entry;
	  corkReq.entry = null;
	  while (entry) {
	    var cb = entry.callback;
	    state.pendingcb--;
	    cb(err);
	    entry = entry.next;
	  }

	  // reuse the free corkReq.
	  state.corkedRequestsFree.next = corkReq;
	}

	Object.defineProperty(Writable.prototype, 'destroyed', {
	  get: function () {
	    if (this._writableState === undefined) {
	      return false;
	    }
	    return this._writableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._writableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._writableState.destroyed = value;
	  }
	});

	Writable.prototype.destroy = destroyImpl.destroy;
	Writable.prototype._undestroy = destroyImpl.undestroy;
	Writable.prototype._destroy = function (err, cb) {
	  this.end();
	  cb(err);
	};
	return _stream_writable;
}

var _stream_duplex;
var hasRequired_stream_duplex;

function require_stream_duplex () {
	if (hasRequired_stream_duplex) return _stream_duplex;
	hasRequired_stream_duplex = 1;

	/*<replacement>*/

	var pna = requireProcessNextickArgs();
	/*</replacement>*/

	/*<replacement>*/
	var objectKeys = Object.keys || function (obj) {
	  var keys = [];
	  for (var key in obj) {
	    keys.push(key);
	  }return keys;
	};
	/*</replacement>*/

	_stream_duplex = Duplex;

	/*<replacement>*/
	var util = Object.create(requireUtil());
	util.inherits = requireInherits();
	/*</replacement>*/

	var Readable = require_stream_readable();
	var Writable = require_stream_writable();

	util.inherits(Duplex, Readable);

	{
	  // avoid scope creep, the keys array can then be collected
	  var keys = objectKeys(Writable.prototype);
	  for (var v = 0; v < keys.length; v++) {
	    var method = keys[v];
	    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
	  }
	}

	function Duplex(options) {
	  if (!(this instanceof Duplex)) return new Duplex(options);

	  Readable.call(this, options);
	  Writable.call(this, options);

	  if (options && options.readable === false) this.readable = false;

	  if (options && options.writable === false) this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

	  this.once('end', onend);
	}

	Object.defineProperty(Duplex.prototype, 'writableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function () {
	    return this._writableState.highWaterMark;
	  }
	});

	// the no-half-open enforcer
	function onend() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended) return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  pna.nextTick(onEndNT, this);
	}

	function onEndNT(self) {
	  self.end();
	}

	Object.defineProperty(Duplex.prototype, 'destroyed', {
	  get: function () {
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed && this._writableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (this._readableState === undefined || this._writableState === undefined) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	    this._writableState.destroyed = value;
	  }
	});

	Duplex.prototype._destroy = function (err, cb) {
	  this.push(null);
	  this.end();

	  pna.nextTick(cb, err);
	};
	return _stream_duplex;
}

var string_decoder = {};

var hasRequiredString_decoder;

function requireString_decoder () {
	if (hasRequiredString_decoder) return string_decoder;
	hasRequiredString_decoder = 1;

	/*<replacement>*/

	var Buffer = requireSafeBuffer().Buffer;
	/*</replacement>*/

	var isEncoding = Buffer.isEncoding || function (encoding) {
	  encoding = '' + encoding;
	  switch (encoding && encoding.toLowerCase()) {
	    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
	      return true;
	    default:
	      return false;
	  }
	};

	function _normalizeEncoding(enc) {
	  if (!enc) return 'utf8';
	  var retried;
	  while (true) {
	    switch (enc) {
	      case 'utf8':
	      case 'utf-8':
	        return 'utf8';
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return 'utf16le';
	      case 'latin1':
	      case 'binary':
	        return 'latin1';
	      case 'base64':
	      case 'ascii':
	      case 'hex':
	        return enc;
	      default:
	        if (retried) return; // undefined
	        enc = ('' + enc).toLowerCase();
	        retried = true;
	    }
	  }
	}
	// Do not cache `Buffer.isEncoding` when checking encoding names as some
	// modules monkey-patch it to support additional encodings
	function normalizeEncoding(enc) {
	  var nenc = _normalizeEncoding(enc);
	  if (typeof nenc !== 'string' && (Buffer.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
	  return nenc || enc;
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters.
	string_decoder.StringDecoder = StringDecoder;
	function StringDecoder(encoding) {
	  this.encoding = normalizeEncoding(encoding);
	  var nb;
	  switch (this.encoding) {
	    case 'utf16le':
	      this.text = utf16Text;
	      this.end = utf16End;
	      nb = 4;
	      break;
	    case 'utf8':
	      this.fillLast = utf8FillLast;
	      nb = 4;
	      break;
	    case 'base64':
	      this.text = base64Text;
	      this.end = base64End;
	      nb = 3;
	      break;
	    default:
	      this.write = simpleWrite;
	      this.end = simpleEnd;
	      return;
	  }
	  this.lastNeed = 0;
	  this.lastTotal = 0;
	  this.lastChar = Buffer.allocUnsafe(nb);
	}

	StringDecoder.prototype.write = function (buf) {
	  if (buf.length === 0) return '';
	  var r;
	  var i;
	  if (this.lastNeed) {
	    r = this.fillLast(buf);
	    if (r === undefined) return '';
	    i = this.lastNeed;
	    this.lastNeed = 0;
	  } else {
	    i = 0;
	  }
	  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
	  return r || '';
	};

	StringDecoder.prototype.end = utf8End;

	// Returns only complete characters in a Buffer
	StringDecoder.prototype.text = utf8Text;

	// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
	StringDecoder.prototype.fillLast = function (buf) {
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
	  this.lastNeed -= buf.length;
	};

	// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
	// continuation byte. If an invalid byte is detected, -2 is returned.
	function utf8CheckByte(byte) {
	  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
	  return byte >> 6 === 0x02 ? -1 : -2;
	}

	// Checks at most 3 bytes at the end of a Buffer in order to detect an
	// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
	// needed to complete the UTF-8 character (if applicable) are returned.
	function utf8CheckIncomplete(self, buf, i) {
	  var j = buf.length - 1;
	  if (j < i) return 0;
	  var nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 1;
	    return nb;
	  }
	  if (--j < i || nb === -2) return 0;
	  nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) self.lastNeed = nb - 2;
	    return nb;
	  }
	  if (--j < i || nb === -2) return 0;
	  nb = utf8CheckByte(buf[j]);
	  if (nb >= 0) {
	    if (nb > 0) {
	      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
	    }
	    return nb;
	  }
	  return 0;
	}

	// Validates as many continuation bytes for a multi-byte UTF-8 character as
	// needed or are available. If we see a non-continuation byte where we expect
	// one, we "replace" the validated continuation bytes we've seen so far with
	// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
	// behavior. The continuation byte check is included three times in the case
	// where all of the continuation bytes for a character exist in the same buffer.
	// It is also done this way as a slight performance increase instead of using a
	// loop.
	function utf8CheckExtraBytes(self, buf, p) {
	  if ((buf[0] & 0xC0) !== 0x80) {
	    self.lastNeed = 0;
	    return '\ufffd';
	  }
	  if (self.lastNeed > 1 && buf.length > 1) {
	    if ((buf[1] & 0xC0) !== 0x80) {
	      self.lastNeed = 1;
	      return '\ufffd';
	    }
	    if (self.lastNeed > 2 && buf.length > 2) {
	      if ((buf[2] & 0xC0) !== 0x80) {
	        self.lastNeed = 2;
	        return '\ufffd';
	      }
	    }
	  }
	}

	// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
	function utf8FillLast(buf) {
	  var p = this.lastTotal - this.lastNeed;
	  var r = utf8CheckExtraBytes(this, buf);
	  if (r !== undefined) return r;
	  if (this.lastNeed <= buf.length) {
	    buf.copy(this.lastChar, p, 0, this.lastNeed);
	    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
	  }
	  buf.copy(this.lastChar, p, 0, buf.length);
	  this.lastNeed -= buf.length;
	}

	// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
	// partial character, the character's bytes are buffered until the required
	// number of bytes are available.
	function utf8Text(buf, i) {
	  var total = utf8CheckIncomplete(this, buf, i);
	  if (!this.lastNeed) return buf.toString('utf8', i);
	  this.lastTotal = total;
	  var end = buf.length - (total - this.lastNeed);
	  buf.copy(this.lastChar, 0, end);
	  return buf.toString('utf8', i, end);
	}

	// For UTF-8, a replacement character is added when ending on a partial
	// character.
	function utf8End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + '\ufffd';
	  return r;
	}

	// UTF-16LE typically needs two bytes per character, but even if we have an even
	// number of bytes available, we need to check if we end on a leading/high
	// surrogate. In that case, we need to wait for the next two bytes in order to
	// decode the last character properly.
	function utf16Text(buf, i) {
	  if ((buf.length - i) % 2 === 0) {
	    var r = buf.toString('utf16le', i);
	    if (r) {
	      var c = r.charCodeAt(r.length - 1);
	      if (c >= 0xD800 && c <= 0xDBFF) {
	        this.lastNeed = 2;
	        this.lastTotal = 4;
	        this.lastChar[0] = buf[buf.length - 2];
	        this.lastChar[1] = buf[buf.length - 1];
	        return r.slice(0, -1);
	      }
	    }
	    return r;
	  }
	  this.lastNeed = 1;
	  this.lastTotal = 2;
	  this.lastChar[0] = buf[buf.length - 1];
	  return buf.toString('utf16le', i, buf.length - 1);
	}

	// For UTF-16LE we do not explicitly append special replacement characters if we
	// end on a partial character, we simply let v8 handle that.
	function utf16End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) {
	    var end = this.lastTotal - this.lastNeed;
	    return r + this.lastChar.toString('utf16le', 0, end);
	  }
	  return r;
	}

	function base64Text(buf, i) {
	  var n = (buf.length - i) % 3;
	  if (n === 0) return buf.toString('base64', i);
	  this.lastNeed = 3 - n;
	  this.lastTotal = 3;
	  if (n === 1) {
	    this.lastChar[0] = buf[buf.length - 1];
	  } else {
	    this.lastChar[0] = buf[buf.length - 2];
	    this.lastChar[1] = buf[buf.length - 1];
	  }
	  return buf.toString('base64', i, buf.length - n);
	}

	function base64End(buf) {
	  var r = buf && buf.length ? this.write(buf) : '';
	  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
	  return r;
	}

	// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
	function simpleWrite(buf) {
	  return buf.toString(this.encoding);
	}

	function simpleEnd(buf) {
	  return buf && buf.length ? this.write(buf) : '';
	}
	return string_decoder;
}

var _stream_readable;
var hasRequired_stream_readable;

function require_stream_readable () {
	if (hasRequired_stream_readable) return _stream_readable;
	hasRequired_stream_readable = 1;

	/*<replacement>*/

	var pna = requireProcessNextickArgs();
	/*</replacement>*/

	_stream_readable = Readable;

	/*<replacement>*/
	var isArray = requireIsarray();
	/*</replacement>*/

	/*<replacement>*/
	var Duplex;
	/*</replacement>*/

	Readable.ReadableState = ReadableState;

	/*<replacement>*/
	require$$4.EventEmitter;

	var EElistenerCount = function (emitter, type) {
	  return emitter.listeners(type).length;
	};
	/*</replacement>*/

	/*<replacement>*/
	var Stream = requireStream();
	/*</replacement>*/

	/*<replacement>*/

	var Buffer = requireSafeBuffer().Buffer;
	var OurUint8Array = (typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : {}).Uint8Array || function () {};
	function _uint8ArrayToBuffer(chunk) {
	  return Buffer.from(chunk);
	}
	function _isUint8Array(obj) {
	  return Buffer.isBuffer(obj) || obj instanceof OurUint8Array;
	}

	/*</replacement>*/

	/*<replacement>*/
	var util = Object.create(requireUtil());
	util.inherits = requireInherits();
	/*</replacement>*/

	/*<replacement>*/
	var debugUtil = require$$0$8;
	var debug = void 0;
	if (debugUtil && debugUtil.debuglog) {
	  debug = debugUtil.debuglog('stream');
	} else {
	  debug = function () {};
	}
	/*</replacement>*/

	var BufferList = requireBufferList();
	var destroyImpl = requireDestroy();
	var StringDecoder;

	util.inherits(Readable, Stream);

	var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

	function prependListener(emitter, event, fn) {
	  // Sadly this is not cacheable as some libraries bundle their own
	  // event emitter implementation with them.
	  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn);

	  // This is a hack to make sure that our error handler is attached before any
	  // userland ones.  NEVER DO THIS. This is here only because this code needs
	  // to continue to work with older versions of Node.js that do not include
	  // the prependListener() method. The goal is to eventually remove this hack.
	  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
	}

	function ReadableState(options, stream) {
	  Duplex = Duplex || require_stream_duplex();

	  options = options || {};

	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream.
	  // These options can be provided separately as readableXXX and writableXXX.
	  var isDuplex = stream instanceof Duplex;

	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  var readableHwm = options.readableHighWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;

	  if (hwm || hwm === 0) this.highWaterMark = hwm;else if (isDuplex && (readableHwm || readableHwm === 0)) this.highWaterMark = readableHwm;else this.highWaterMark = defaultHwm;

	  // cast to ints.
	  this.highWaterMark = Math.floor(this.highWaterMark);

	  // A linked list is used to store data chunks instead of an array because the
	  // linked list can remove elements from the beginning faster than
	  // array.shift()
	  this.buffer = new BufferList();
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the event 'readable'/'data' is emitted
	  // immediately, or on a later tick.  We set this to true at first, because
	  // any actions that shouldn't happen until "later" should generally also
	  // not happen before the first read call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;
	  this.resumeScheduled = false;

	  // has it been destroyed
	  this.destroyed = false;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}

	function Readable(options) {
	  Duplex = Duplex || require_stream_duplex();

	  if (!(this instanceof Readable)) return new Readable(options);

	  this._readableState = new ReadableState(options, this);

	  // legacy
	  this.readable = true;

	  if (options) {
	    if (typeof options.read === 'function') this._read = options.read;

	    if (typeof options.destroy === 'function') this._destroy = options.destroy;
	  }

	  Stream.call(this);
	}

	Object.defineProperty(Readable.prototype, 'destroyed', {
	  get: function () {
	    if (this._readableState === undefined) {
	      return false;
	    }
	    return this._readableState.destroyed;
	  },
	  set: function (value) {
	    // we ignore the value if the stream
	    // has not been initialized yet
	    if (!this._readableState) {
	      return;
	    }

	    // backward compatibility, the user is explicitly
	    // managing destroyed
	    this._readableState.destroyed = value;
	  }
	});

	Readable.prototype.destroy = destroyImpl.destroy;
	Readable.prototype._undestroy = destroyImpl.undestroy;
	Readable.prototype._destroy = function (err, cb) {
	  this.push(null);
	  cb(err);
	};

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function (chunk, encoding) {
	  var state = this._readableState;
	  var skipChunkCheck;

	  if (!state.objectMode) {
	    if (typeof chunk === 'string') {
	      encoding = encoding || state.defaultEncoding;
	      if (encoding !== state.encoding) {
	        chunk = Buffer.from(chunk, encoding);
	        encoding = '';
	      }
	      skipChunkCheck = true;
	    }
	  } else {
	    skipChunkCheck = true;
	  }

	  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function (chunk) {
	  return readableAddChunk(this, chunk, null, true, false);
	};

	function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
	  var state = stream._readableState;
	  if (chunk === null) {
	    state.reading = false;
	    onEofChunk(stream, state);
	  } else {
	    var er;
	    if (!skipChunkCheck) er = chunkInvalid(state, chunk);
	    if (er) {
	      stream.emit('error', er);
	    } else if (state.objectMode || chunk && chunk.length > 0) {
	      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer.prototype) {
	        chunk = _uint8ArrayToBuffer(chunk);
	      }

	      if (addToFront) {
	        if (state.endEmitted) stream.emit('error', new Error('stream.unshift() after end event'));else addChunk(stream, state, chunk, true);
	      } else if (state.ended) {
	        stream.emit('error', new Error('stream.push() after EOF'));
	      } else {
	        state.reading = false;
	        if (state.decoder && !encoding) {
	          chunk = state.decoder.write(chunk);
	          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
	        } else {
	          addChunk(stream, state, chunk, false);
	        }
	      }
	    } else if (!addToFront) {
	      state.reading = false;
	    }
	  }

	  return needMoreData(state);
	}

	function addChunk(stream, state, chunk, addToFront) {
	  if (state.flowing && state.length === 0 && !state.sync) {
	    stream.emit('data', chunk);
	    stream.read(0);
	  } else {
	    // update the buffer info.
	    state.length += state.objectMode ? 1 : chunk.length;
	    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

	    if (state.needReadable) emitReadable(stream);
	  }
	  maybeReadMore(stream, state);
	}

	function chunkInvalid(state, chunk) {
	  var er;
	  if (!_isUint8Array(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}

	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
	}

	Readable.prototype.isPaused = function () {
	  return this._readableState.flowing === false;
	};

	// backwards compatibility.
	Readable.prototype.setEncoding = function (enc) {
	  if (!StringDecoder) StringDecoder = requireString_decoder().StringDecoder;
	  this._readableState.decoder = new StringDecoder(enc);
	  this._readableState.encoding = enc;
	  return this;
	};

	// Don't raise the hwm > 8MB
	var MAX_HWM = 0x800000;
	function computeNewHighWaterMark(n) {
	  if (n >= MAX_HWM) {
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2 to prevent increasing hwm excessively in
	    // tiny amounts
	    n--;
	    n |= n >>> 1;
	    n |= n >>> 2;
	    n |= n >>> 4;
	    n |= n >>> 8;
	    n |= n >>> 16;
	    n++;
	  }
	  return n;
	}

	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function howMuchToRead(n, state) {
	  if (n <= 0 || state.length === 0 && state.ended) return 0;
	  if (state.objectMode) return 1;
	  if (n !== n) {
	    // Only flow one buffer at a time
	    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
	  }
	  // If we're asking for more than the current hwm, then raise the hwm.
	  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
	  if (n <= state.length) return n;
	  // Don't have enough
	  if (!state.ended) {
	    state.needReadable = true;
	    return 0;
	  }
	  return state.length;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function (n) {
	  debug('read', n);
	  n = parseInt(n, 10);
	  var state = this._readableState;
	  var nOrig = n;

	  if (n !== 0) state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
	    return null;
	  }

	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0) endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug('reading or ended', doRead);
	  } else if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0) state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	    // If _read pushed data synchronously, then `reading` will be false,
	    // and we need to re-evaluate how much data we can return to the user.
	    if (!state.reading) n = howMuchToRead(nOrig, state);
	  }

	  var ret;
	  if (n > 0) ret = fromList(n, state);else ret = null;

	  if (ret === null) {
	    state.needReadable = true;
	    n = 0;
	  } else {
	    state.length -= n;
	  }

	  if (state.length === 0) {
	    // If we have nothing in the buffer, then we want to know
	    // as soon as we *do* get something into the buffer.
	    if (!state.ended) state.needReadable = true;

	    // If we tried to read() past the EOF, then emit end on the next tick.
	    if (nOrig !== n && state.ended) endReadable(this);
	  }

	  if (ret !== null) this.emit('data', ret);

	  return ret;
	};

	function onEofChunk(stream, state) {
	  if (state.ended) return;
	  if (state.decoder) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // emit 'readable' now to make sure it gets picked up.
	  emitReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    if (state.sync) pna.nextTick(emitReadable_, stream);else emitReadable_(stream);
	  }
	}

	function emitReadable_(stream) {
	  debug('emit readable');
	  stream.emit('readable');
	  flow(stream);
	}

	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    pna.nextTick(maybeReadMore_, stream, state);
	  }
	}

	function maybeReadMore_(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;else len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function (n) {
	  this.emit('error', new Error('_read() is not implemented'));
	};

	Readable.prototype.pipe = function (dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;

	  var endFn = doEnd ? onend : unpipe;
	  if (state.endEmitted) pna.nextTick(endFn);else src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable, unpipeInfo) {
	    debug('onunpipe');
	    if (readable === src) {
	      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
	        unpipeInfo.hasUnpiped = true;
	        cleanup();
	      }
	    }
	  }

	  function onend() {
	    debug('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);

	  var cleanedUp = false;
	  function cleanup() {
	    debug('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', unpipe);
	    src.removeListener('data', ondata);

	    cleanedUp = true;

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
	  }

	  // If the user pushes more data while we're writing to dest then we'll end up
	  // in ondata again. However, we only want to increase awaitDrain once because
	  // dest will only emit one 'drain' event for the multiple writes.
	  // => Introduce a guard on increasing awaitDrain.
	  var increasedAwaitDrain = false;
	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    increasedAwaitDrain = false;
	    var ret = dest.write(chunk);
	    if (false === ret && !increasedAwaitDrain) {
	      // If the user unpiped during `dest.write()`, it is possible
	      // to get stuck in a permanently paused state if that write
	      // also returned false.
	      // => Check whether `dest` is still a piping destination.
	      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
	        debug('false write response, pause', state.awaitDrain);
	        state.awaitDrain++;
	        increasedAwaitDrain = true;
	      }
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (EElistenerCount(dest, 'error') === 0) dest.emit('error', er);
	  }

	  // Make sure our error handler is attached before userland ones.
	  prependListener(dest, 'error', onerror);

	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain(src) {
	  return function () {
	    var state = src._readableState;
	    debug('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain) state.awaitDrain--;
	    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
	      state.flowing = true;
	      flow(src);
	    }
	  };
	}

	Readable.prototype.unpipe = function (dest) {
	  var state = this._readableState;
	  var unpipeInfo = { hasUnpiped: false };

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0) return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes) return this;

	    if (!dest) dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest) dest.emit('unpipe', this, unpipeInfo);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var i = 0; i < len; i++) {
	      dests[i].emit('unpipe', this, { hasUnpiped: false });
	    }return this;
	  }

	  // try to find the right one.
	  var index = indexOf(state.pipes, dest);
	  if (index === -1) return this;

	  state.pipes.splice(index, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1) state.pipes = state.pipes[0];

	  dest.emit('unpipe', this, unpipeInfo);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function (ev, fn) {
	  var res = Stream.prototype.on.call(this, ev, fn);

	  if (ev === 'data') {
	    // Start flowing on next tick if stream isn't explicitly paused
	    if (this._readableState.flowing !== false) this.resume();
	  } else if (ev === 'readable') {
	    var state = this._readableState;
	    if (!state.endEmitted && !state.readableListening) {
	      state.readableListening = state.needReadable = true;
	      state.emittedReadable = false;
	      if (!state.reading) {
	        pna.nextTick(nReadingNextTick, this);
	      } else if (state.length) {
	        emitReadable(this);
	      }
	    }
	  }

	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	function nReadingNextTick(self) {
	  debug('readable nexttick read 0');
	  self.read(0);
	}

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function () {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    state.flowing = true;
	    resume(this, state);
	  }
	  return this;
	};

	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    pna.nextTick(resume_, stream, state);
	  }
	}

	function resume_(stream, state) {
	  if (!state.reading) {
	    debug('resume read 0');
	    stream.read(0);
	  }

	  state.resumeScheduled = false;
	  state.awaitDrain = 0;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading) stream.read(0);
	}

	Readable.prototype.pause = function () {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (false !== this._readableState.flowing) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  return this;
	};

	function flow(stream) {
	  var state = stream._readableState;
	  debug('flow', state.flowing);
	  while (state.flowing && stream.read() !== null) {}
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function (stream) {
	  var _this = this;

	  var state = this._readableState;
	  var paused = false;

	  stream.on('end', function () {
	    debug('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length) _this.push(chunk);
	    }

	    _this.push(null);
	  });

	  stream.on('data', function (chunk) {
	    debug('wrapped data');
	    if (state.decoder) chunk = state.decoder.write(chunk);

	    // don't skip over falsy values in objectMode
	    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

	    var ret = _this.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (this[i] === undefined && typeof stream[i] === 'function') {
	      this[i] = function (method) {
	        return function () {
	          return stream[method].apply(stream, arguments);
	        };
	      }(i);
	    }
	  }

	  // proxy certain important events.
	  for (var n = 0; n < kProxyEvents.length; n++) {
	    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
	  }

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  this._read = function (n) {
	    debug('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return this;
	};

	Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
	  // making it explicit this property is not enumerable
	  // because otherwise some prototype manipulation in
	  // userland will fail
	  enumerable: false,
	  get: function () {
	    return this._readableState.highWaterMark;
	  }
	});

	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromList(n, state) {
	  // nothing buffered
	  if (state.length === 0) return null;

	  var ret;
	  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
	    // read it all, truncate the list
	    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
	    state.buffer.clear();
	  } else {
	    // read part of list
	    ret = fromListPartial(n, state.buffer, state.decoder);
	  }

	  return ret;
	}

	// Extracts only enough buffered data to satisfy the amount requested.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromListPartial(n, list, hasStrings) {
	  var ret;
	  if (n < list.head.data.length) {
	    // slice is the same for buffers and strings
	    ret = list.head.data.slice(0, n);
	    list.head.data = list.head.data.slice(n);
	  } else if (n === list.head.data.length) {
	    // first chunk is a perfect match
	    ret = list.shift();
	  } else {
	    // result spans more than one buffer
	    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
	  }
	  return ret;
	}

	// Copies a specified amount of characters from the list of buffered data
	// chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBufferString(n, list) {
	  var p = list.head;
	  var c = 1;
	  var ret = p.data;
	  n -= ret.length;
	  while (p = p.next) {
	    var str = p.data;
	    var nb = n > str.length ? str.length : n;
	    if (nb === str.length) ret += str;else ret += str.slice(0, n);
	    n -= nb;
	    if (n === 0) {
	      if (nb === str.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = str.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	// Copies a specified amount of bytes from the list of buffered data chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBuffer(n, list) {
	  var ret = Buffer.allocUnsafe(n);
	  var p = list.head;
	  var c = 1;
	  p.data.copy(ret);
	  n -= p.data.length;
	  while (p = p.next) {
	    var buf = p.data;
	    var nb = n > buf.length ? buf.length : n;
	    buf.copy(ret, ret.length - n, 0, nb);
	    n -= nb;
	    if (n === 0) {
	      if (nb === buf.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = buf.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	function endReadable(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

	  if (!state.endEmitted) {
	    state.ended = true;
	    pna.nextTick(endReadableNT, state, stream);
	  }
	}

	function endReadableNT(state, stream) {
	  // Check that we didn't get one last unshift.
	  if (!state.endEmitted && state.length === 0) {
	    state.endEmitted = true;
	    stream.readable = false;
	    stream.emit('end');
	  }
	}

	function indexOf(xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}
	return _stream_readable;
}

var _stream_transform;
var hasRequired_stream_transform;

function require_stream_transform () {
	if (hasRequired_stream_transform) return _stream_transform;
	hasRequired_stream_transform = 1;

	_stream_transform = Transform;

	var Duplex = require_stream_duplex();

	/*<replacement>*/
	var util = Object.create(requireUtil());
	util.inherits = requireInherits();
	/*</replacement>*/

	util.inherits(Transform, Duplex);

	function afterTransform(er, data) {
	  var ts = this._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb) {
	    return this.emit('error', new Error('write callback called multiple times'));
	  }

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (data != null) // single equals check for both `null` and `undefined`
	    this.push(data);

	  cb(er);

	  var rs = this._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    this._read(rs.highWaterMark);
	  }
	}

	function Transform(options) {
	  if (!(this instanceof Transform)) return new Transform(options);

	  Duplex.call(this, options);

	  this._transformState = {
	    afterTransform: afterTransform.bind(this),
	    needTransform: false,
	    transforming: false,
	    writecb: null,
	    writechunk: null,
	    writeencoding: null
	  };

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  if (options) {
	    if (typeof options.transform === 'function') this._transform = options.transform;

	    if (typeof options.flush === 'function') this._flush = options.flush;
	  }

	  // When the writable side finishes, then flush out anything remaining.
	  this.on('prefinish', prefinish);
	}

	function prefinish() {
	  var _this = this;

	  if (typeof this._flush === 'function') {
	    this._flush(function (er, data) {
	      done(_this, er, data);
	    });
	  } else {
	    done(this, null, null);
	  }
	}

	Transform.prototype.push = function (chunk, encoding) {
	  this._transformState.needTransform = false;
	  return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function (chunk, encoding, cb) {
	  throw new Error('_transform() is not implemented');
	};

	Transform.prototype._write = function (chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function (n) {
	  var ts = this._transformState;

	  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};

	Transform.prototype._destroy = function (err, cb) {
	  var _this2 = this;

	  Duplex.prototype._destroy.call(this, err, function (err2) {
	    cb(err2);
	    _this2.emit('close');
	  });
	};

	function done(stream, er, data) {
	  if (er) return stream.emit('error', er);

	  if (data != null) // single equals check for both `null` and `undefined`
	    stream.push(data);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  if (stream._writableState.length) throw new Error('Calling transform done when ws.length != 0');

	  if (stream._transformState.transforming) throw new Error('Calling transform done when still transforming');

	  return stream.push(null);
	}
	return _stream_transform;
}

var _stream_passthrough;
var hasRequired_stream_passthrough;

function require_stream_passthrough () {
	if (hasRequired_stream_passthrough) return _stream_passthrough;
	hasRequired_stream_passthrough = 1;

	_stream_passthrough = PassThrough;

	var Transform = require_stream_transform();

	/*<replacement>*/
	var util = Object.create(requireUtil());
	util.inherits = requireInherits();
	/*</replacement>*/

	util.inherits(PassThrough, Transform);

	function PassThrough(options) {
	  if (!(this instanceof PassThrough)) return new PassThrough(options);

	  Transform.call(this, options);
	}

	PassThrough.prototype._transform = function (chunk, encoding, cb) {
	  cb(null, chunk);
	};
	return _stream_passthrough;
}

(function (module, exports) {
	var Stream = require$$0$5;
	if (process.env.READABLE_STREAM === 'disable' && Stream) {
	  module.exports = Stream;
	  exports = module.exports = Stream.Readable;
	  exports.Readable = Stream.Readable;
	  exports.Writable = Stream.Writable;
	  exports.Duplex = Stream.Duplex;
	  exports.Transform = Stream.Transform;
	  exports.PassThrough = Stream.PassThrough;
	  exports.Stream = Stream;
	} else {
	  exports = module.exports = require_stream_readable();
	  exports.Stream = Stream || exports;
	  exports.Readable = exports;
	  exports.Writable = require_stream_writable();
	  exports.Duplex = require_stream_duplex();
	  exports.Transform = require_stream_transform();
	  exports.PassThrough = require_stream_passthrough();
	} 
} (readable, readable.exports));

var readableExports = readable.exports;

var duplex = readableExports.Duplex;

var DuplexStream = duplex
  , util$5         = require$$0$8
  , Buffer$3       = safeBufferExports.Buffer;


function BufferList (callback) {
  if (!(this instanceof BufferList))
    return new BufferList(callback)

  this._bufs  = [];
  this.length = 0;

  if (typeof callback == 'function') {
    this._callback = callback;

    var piper = function piper (err) {
      if (this._callback) {
        this._callback(err);
        this._callback = null;
      }
    }.bind(this);

    this.on('pipe', function onPipe (src) {
      src.on('error', piper);
    });
    this.on('unpipe', function onUnpipe (src) {
      src.removeListener('error', piper);
    });
  } else {
    this.append(callback);
  }

  DuplexStream.call(this);
}


util$5.inherits(BufferList, DuplexStream);


BufferList.prototype._offset = function _offset (offset) {
  var tot = 0, i = 0, _t;
  if (offset === 0) return [ 0, 0 ]
  for (; i < this._bufs.length; i++) {
    _t = tot + this._bufs[i].length;
    if (offset < _t || i == this._bufs.length - 1)
      return [ i, offset - tot ]
    tot = _t;
  }
};


BufferList.prototype.append = function append (buf) {
  var i = 0;

  if (Buffer$3.isBuffer(buf)) {
    this._appendBuffer(buf);
  } else if (Array.isArray(buf)) {
    for (; i < buf.length; i++)
      this.append(buf[i]);
  } else if (buf instanceof BufferList) {
    // unwrap argument into individual BufferLists
    for (; i < buf._bufs.length; i++)
      this.append(buf._bufs[i]);
  } else if (buf != null) {
    // coerce number arguments to strings, since Buffer(number) does
    // uninitialized memory allocation
    if (typeof buf == 'number')
      buf = buf.toString();

    this._appendBuffer(Buffer$3.from(buf));
  }

  return this
};


BufferList.prototype._appendBuffer = function appendBuffer (buf) {
  this._bufs.push(buf);
  this.length += buf.length;
};


BufferList.prototype._write = function _write (buf, encoding, callback) {
  this._appendBuffer(buf);

  if (typeof callback == 'function')
    callback();
};


BufferList.prototype._read = function _read (size) {
  if (!this.length)
    return this.push(null)

  size = Math.min(size, this.length);
  this.push(this.slice(0, size));
  this.consume(size);
};


BufferList.prototype.end = function end (chunk) {
  DuplexStream.prototype.end.call(this, chunk);

  if (this._callback) {
    this._callback(null, this.slice());
    this._callback = null;
  }
};


BufferList.prototype.get = function get (index) {
  return this.slice(index, index + 1)[0]
};


BufferList.prototype.slice = function slice (start, end) {
  if (typeof start == 'number' && start < 0)
    start += this.length;
  if (typeof end == 'number' && end < 0)
    end += this.length;
  return this.copy(null, 0, start, end)
};


BufferList.prototype.copy = function copy (dst, dstStart, srcStart, srcEnd) {
  if (typeof srcStart != 'number' || srcStart < 0)
    srcStart = 0;
  if (typeof srcEnd != 'number' || srcEnd > this.length)
    srcEnd = this.length;
  if (srcStart >= this.length)
    return dst || Buffer$3.alloc(0)
  if (srcEnd <= 0)
    return dst || Buffer$3.alloc(0)

  var copy   = !!dst
    , off    = this._offset(srcStart)
    , len    = srcEnd - srcStart
    , bytes  = len
    , bufoff = (copy && dstStart) || 0
    , start  = off[1]
    , l
    , i;

  // copy/slice everything
  if (srcStart === 0 && srcEnd == this.length) {
    if (!copy) { // slice, but full concat if multiple buffers
      return this._bufs.length === 1
        ? this._bufs[0]
        : Buffer$3.concat(this._bufs, this.length)
    }

    // copy, need to copy individual buffers
    for (i = 0; i < this._bufs.length; i++) {
      this._bufs[i].copy(dst, bufoff);
      bufoff += this._bufs[i].length;
    }

    return dst
  }

  // easy, cheap case where it's a subset of one of the buffers
  if (bytes <= this._bufs[off[0]].length - start) {
    return copy
      ? this._bufs[off[0]].copy(dst, dstStart, start, start + bytes)
      : this._bufs[off[0]].slice(start, start + bytes)
  }

  if (!copy) // a slice, we need something to copy in to
    dst = Buffer$3.allocUnsafe(len);

  for (i = off[0]; i < this._bufs.length; i++) {
    l = this._bufs[i].length - start;

    if (bytes > l) {
      this._bufs[i].copy(dst, bufoff, start);
      bufoff += l;
    } else {
      this._bufs[i].copy(dst, bufoff, start, start + bytes);
      bufoff += l;
      break
    }

    bytes -= l;

    if (start)
      start = 0;
  }

  // safeguard so that we don't return uninitialized memory
  if (dst.length > bufoff) return dst.slice(0, bufoff)

  return dst
};

BufferList.prototype.shallowSlice = function shallowSlice (start, end) {
  start = start || 0;
  end = end || this.length;

  if (start < 0)
    start += this.length;
  if (end < 0)
    end += this.length;

  var startOffset = this._offset(start)
    , endOffset = this._offset(end)
    , buffers = this._bufs.slice(startOffset[0], endOffset[0] + 1);

  if (endOffset[1] == 0)
    buffers.pop();
  else
    buffers[buffers.length-1] = buffers[buffers.length-1].slice(0, endOffset[1]);

  if (startOffset[1] != 0)
    buffers[0] = buffers[0].slice(startOffset[1]);

  return new BufferList(buffers)
};

BufferList.prototype.toString = function toString (encoding, start, end) {
  return this.slice(start, end).toString(encoding)
};

BufferList.prototype.consume = function consume (bytes) {
  // first, normalize the argument, in accordance with how Buffer does it
  bytes = Math.trunc(bytes);
  // do nothing if not a positive number
  if (Number.isNaN(bytes) || bytes <= 0) return this

  while (this._bufs.length) {
    if (bytes >= this._bufs[0].length) {
      bytes -= this._bufs[0].length;
      this.length -= this._bufs[0].length;
      this._bufs.shift();
    } else {
      this._bufs[0] = this._bufs[0].slice(bytes);
      this.length -= bytes;
      break
    }
  }
  return this
};


BufferList.prototype.duplicate = function duplicate () {
  var i = 0
    , copy = new BufferList();

  for (; i < this._bufs.length; i++)
    copy.append(this._bufs[i]);

  return copy
};


BufferList.prototype.destroy = function destroy () {
  this._bufs.length = 0;
  this.length = 0;
  this.push(null);
}


;(function () {
  var methods = {
      'readDoubleBE' : 8
    , 'readDoubleLE' : 8
    , 'readFloatBE'  : 4
    , 'readFloatLE'  : 4
    , 'readInt32BE'  : 4
    , 'readInt32LE'  : 4
    , 'readUInt32BE' : 4
    , 'readUInt32LE' : 4
    , 'readInt16BE'  : 2
    , 'readInt16LE'  : 2
    , 'readUInt16BE' : 2
    , 'readUInt16LE' : 2
    , 'readInt8'     : 1
    , 'readUInt8'    : 1
  };

  for (var m in methods) {
    (function (m) {
      BufferList.prototype[m] = function (offset) {
        return this.slice(offset, offset + methods[m])[m](0)
      };
    }(m));
  }
}());


var bl$1 = BufferList;

var immutable = extend;

var hasOwnProperty$1 = Object.prototype.hasOwnProperty;

function extend() {
    var target = {};

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
            if (hasOwnProperty$1.call(source, key)) {
                target[key] = source[key];
            }
        }
    }

    return target
}

var headers$2 = {};

var toBuffer_1 = toBuffer$2;

var makeBuffer = Buffer.from && Buffer.from !== Uint8Array.from ? Buffer.from : bufferFrom;

function bufferFrom (buf, enc) {
  return new Buffer(buf, enc)
}

function toBuffer$2 (buf, enc) {
  if (Buffer.isBuffer(buf)) return buf
  if (typeof buf === 'string') return makeBuffer(buf, enc)
  if (Array.isArray(buf)) return makeBuffer(buf)
  throw new Error('Input should be a buffer or a string')
}

/* Node.js 6.4.0 and up has full support */

var hasFullSupport = (function () {
  try {
    if (!Buffer.isEncoding('latin1')) {
      return false
    }

    var buf = Buffer.alloc ? Buffer.alloc(4) : new Buffer(4);

    buf.fill('ab', 'ucs2');

    return (buf.toString('hex') === '61006200')
  } catch (_) {
    return false
  }
}());

function isSingleByte (val) {
  return (val.length === 1 && val.charCodeAt(0) < 256)
}

function fillWithNumber (buffer, val, start, end) {
  if (start < 0 || end > buffer.length) {
    throw new RangeError('Out of range index')
  }

  start = start >>> 0;
  end = end === undefined ? buffer.length : end >>> 0;

  if (end > start) {
    buffer.fill(val, start, end);
  }

  return buffer
}

function fillWithBuffer (buffer, val, start, end) {
  if (start < 0 || end > buffer.length) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return buffer
  }

  start = start >>> 0;
  end = end === undefined ? buffer.length : end >>> 0;

  var pos = start;
  var len = val.length;
  while (pos <= (end - len)) {
    val.copy(buffer, pos);
    pos += len;
  }

  if (pos !== end) {
    val.copy(buffer, pos, 0, end - pos);
  }

  return buffer
}

function fill (buffer, val, start, end, encoding) {
  if (hasFullSupport) {
    return buffer.fill(val, start, end, encoding)
  }

  if (typeof val === 'number') {
    return fillWithNumber(buffer, val, start, end)
  }

  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = buffer.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = buffer.length;
    }

    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }

    if (encoding === 'latin1') {
      encoding = 'binary';
    }

    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }

    if (val === '') {
      return fillWithNumber(buffer, 0, start, end)
    }

    if (isSingleByte(val)) {
      return fillWithNumber(buffer, val.charCodeAt(0), start, end)
    }

    val = new Buffer(val, encoding);
  }

  if (Buffer.isBuffer(val)) {
    return fillWithBuffer(buffer, val, start, end)
  }

  // Other values (e.g. undefined, boolean, object) results in zero-fill
  return fillWithNumber(buffer, 0, start, end)
}

var bufferFill$1 = fill;

function allocUnsafe$1 (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  }

  if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }

  if (Buffer.allocUnsafe) {
    return Buffer.allocUnsafe(size)
  } else {
    return new Buffer(size)
  }
}

var bufferAllocUnsafe = allocUnsafe$1;

var bufferFill = bufferFill$1;
var allocUnsafe = bufferAllocUnsafe;

var bufferAlloc = function alloc (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  }

  if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }

  if (Buffer.alloc) {
    return Buffer.alloc(size, fill, encoding)
  }

  var buffer = allocUnsafe(size);

  if (size === 0) {
    return buffer
  }

  if (fill === undefined) {
    return bufferFill(buffer, 0)
  }

  if (typeof encoding !== 'string') {
    encoding = undefined;
  }

  return bufferFill(buffer, fill, encoding)
};

var toBuffer$1 = toBuffer_1;
var alloc$1 = bufferAlloc;

var ZEROS = '0000000000000000000';
var SEVENS = '7777777777777777777';
var ZERO_OFFSET = '0'.charCodeAt(0);
var USTAR = 'ustar\x0000';
var MASK = parseInt('7777', 8);

var clamp = function (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index; // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len;
  if (index >= 0) return index
  return 0
};

var toType = function (flag) {
  switch (flag) {
    case 0:
      return 'file'
    case 1:
      return 'link'
    case 2:
      return 'symlink'
    case 3:
      return 'character-device'
    case 4:
      return 'block-device'
    case 5:
      return 'directory'
    case 6:
      return 'fifo'
    case 7:
      return 'contiguous-file'
    case 72:
      return 'pax-header'
    case 55:
      return 'pax-global-header'
    case 27:
      return 'gnu-long-link-path'
    case 28:
    case 30:
      return 'gnu-long-path'
  }

  return null
};

var toTypeflag = function (flag) {
  switch (flag) {
    case 'file':
      return 0
    case 'link':
      return 1
    case 'symlink':
      return 2
    case 'character-device':
      return 3
    case 'block-device':
      return 4
    case 'directory':
      return 5
    case 'fifo':
      return 6
    case 'contiguous-file':
      return 7
    case 'pax-header':
      return 72
  }

  return 0
};

var indexOf = function (block, num, offset, end) {
  for (; offset < end; offset++) {
    if (block[offset] === num) return offset
  }
  return end
};

var cksum = function (block) {
  var sum = 8 * 32;
  for (var i = 0; i < 148; i++) sum += block[i];
  for (var j = 156; j < 512; j++) sum += block[j];
  return sum
};

var encodeOct = function (val, n) {
  val = val.toString(8);
  if (val.length > n) return SEVENS.slice(0, n) + ' '
  else return ZEROS.slice(0, n - val.length) + val + ' '
};

/* Copied from the node-tar repo and modified to meet
 * tar-stream coding standard.
 *
 * Source: https://github.com/npm/node-tar/blob/51b6627a1f357d2eb433e7378e5f05e83b7aa6cd/lib/header.js#L349
 */
function parse256 (buf) {
  // first byte MUST be either 80 or FF
  // 80 for positive, FF for 2's comp
  var positive;
  if (buf[0] === 0x80) positive = true;
  else if (buf[0] === 0xFF) positive = false;
  else return null
  var tuple = [];
  for (var i = buf.length - 1; i > 0; i--) {
    var byte = buf[i];
    if (positive) tuple.push(byte);
    else tuple.push(0xFF - byte);
  }

  var sum = 0;
  var l = tuple.length;
  for (i = 0; i < l; i++) {
    sum += tuple[i] * Math.pow(256, i);
  }

  return positive ? sum : -1 * sum
}

var decodeOct = function (val, offset, length) {
  val = val.slice(offset, offset + length);
  offset = 0;

  // If prefixed with 0x80 then parse as a base-256 integer
  if (val[offset] & 0x80) {
    return parse256(val)
  } else {
    // Older versions of tar can prefix with spaces
    while (offset < val.length && val[offset] === 32) offset++;
    var end = clamp(indexOf(val, 32, offset, val.length), val.length, val.length);
    while (offset < end && val[offset] === 0) offset++;
    if (end === offset) return 0
    return parseInt(val.slice(offset, end).toString(), 8)
  }
};

var decodeStr = function (val, offset, length, encoding) {
  return val.slice(offset, indexOf(val, 0, offset, offset + length)).toString(encoding)
};

var addLength = function (str) {
  var len = Buffer.byteLength(str);
  var digits = Math.floor(Math.log(len) / Math.log(10)) + 1;
  if (len + digits >= Math.pow(10, digits)) digits++;

  return (len + digits) + str
};

headers$2.decodeLongPath = function (buf, encoding) {
  return decodeStr(buf, 0, buf.length, encoding)
};

headers$2.encodePax = function (opts) { // TODO: encode more stuff in pax
  var result = '';
  if (opts.name) result += addLength(' path=' + opts.name + '\n');
  if (opts.linkname) result += addLength(' linkpath=' + opts.linkname + '\n');
  var pax = opts.pax;
  if (pax) {
    for (var key in pax) {
      result += addLength(' ' + key + '=' + pax[key] + '\n');
    }
  }
  return toBuffer$1(result)
};

headers$2.decodePax = function (buf) {
  var result = {};

  while (buf.length) {
    var i = 0;
    while (i < buf.length && buf[i] !== 32) i++;
    var len = parseInt(buf.slice(0, i).toString(), 10);
    if (!len) return result

    var b = buf.slice(i + 1, len - 1).toString();
    var keyIndex = b.indexOf('=');
    if (keyIndex === -1) return result
    result[b.slice(0, keyIndex)] = b.slice(keyIndex + 1);

    buf = buf.slice(len);
  }

  return result
};

headers$2.encode = function (opts) {
  var buf = alloc$1(512);
  var name = opts.name;
  var prefix = '';

  if (opts.typeflag === 5 && name[name.length - 1] !== '/') name += '/';
  if (Buffer.byteLength(name) !== name.length) return null // utf-8

  while (Buffer.byteLength(name) > 100) {
    var i = name.indexOf('/');
    if (i === -1) return null
    prefix += prefix ? '/' + name.slice(0, i) : name.slice(0, i);
    name = name.slice(i + 1);
  }

  if (Buffer.byteLength(name) > 100 || Buffer.byteLength(prefix) > 155) return null
  if (opts.linkname && Buffer.byteLength(opts.linkname) > 100) return null

  buf.write(name);
  buf.write(encodeOct(opts.mode & MASK, 6), 100);
  buf.write(encodeOct(opts.uid, 6), 108);
  buf.write(encodeOct(opts.gid, 6), 116);
  buf.write(encodeOct(opts.size, 11), 124);
  buf.write(encodeOct((opts.mtime.getTime() / 1000) | 0, 11), 136);

  buf[156] = ZERO_OFFSET + toTypeflag(opts.type);

  if (opts.linkname) buf.write(opts.linkname, 157);

  buf.write(USTAR, 257);
  if (opts.uname) buf.write(opts.uname, 265);
  if (opts.gname) buf.write(opts.gname, 297);
  buf.write(encodeOct(opts.devmajor || 0, 6), 329);
  buf.write(encodeOct(opts.devminor || 0, 6), 337);

  if (prefix) buf.write(prefix, 345);

  buf.write(encodeOct(cksum(buf), 6), 148);

  return buf
};

headers$2.decode = function (buf, filenameEncoding) {
  var typeflag = buf[156] === 0 ? 0 : buf[156] - ZERO_OFFSET;

  var name = decodeStr(buf, 0, 100, filenameEncoding);
  var mode = decodeOct(buf, 100, 8);
  var uid = decodeOct(buf, 108, 8);
  var gid = decodeOct(buf, 116, 8);
  var size = decodeOct(buf, 124, 12);
  var mtime = decodeOct(buf, 136, 12);
  var type = toType(typeflag);
  var linkname = buf[157] === 0 ? null : decodeStr(buf, 157, 100, filenameEncoding);
  var uname = decodeStr(buf, 265, 32);
  var gname = decodeStr(buf, 297, 32);
  var devmajor = decodeOct(buf, 329, 8);
  var devminor = decodeOct(buf, 337, 8);

  if (buf[345]) name = decodeStr(buf, 345, 155, filenameEncoding) + '/' + name;

  // to support old tar versions that use trailing / to indicate dirs
  if (typeflag === 0 && name && name[name.length - 1] === '/') typeflag = 5;

  var c = cksum(buf);

  // checksum is still initial value if header was null.
  if (c === 8 * 32) return null

  // valid checksum
  if (c !== decodeOct(buf, 148, 8)) throw new Error('Invalid tar header. Maybe the tar is corrupted or it needs to be gunzipped?')

  return {
    name: name,
    mode: mode,
    uid: uid,
    gid: gid,
    size: size,
    mtime: new Date(1000 * mtime),
    type: type,
    linkname: linkname,
    uname: uname,
    gname: gname,
    devmajor: devmajor,
    devminor: devminor
  }
};

var util$4 = require$$0$8;
var bl = bl$1;
var xtend = immutable;
var headers$1 = headers$2;

var Writable$3 = readableExports.Writable;
var PassThrough$7 = readableExports.PassThrough;

var noop$3 = function () {};

var overflow$1 = function (size) {
  size &= 511;
  return size && 512 - size
};

var emptyStream = function (self, offset) {
  var s = new Source(self, offset);
  s.end();
  return s
};

var mixinPax = function (header, pax) {
  if (pax.path) header.name = pax.path;
  if (pax.linkpath) header.linkname = pax.linkpath;
  if (pax.size) header.size = parseInt(pax.size, 10);
  header.pax = pax;
  return header
};

var Source = function (self, offset) {
  this._parent = self;
  this.offset = offset;
  PassThrough$7.call(this);
};

util$4.inherits(Source, PassThrough$7);

Source.prototype.destroy = function (err) {
  this._parent.destroy(err);
};

var Extract = function (opts) {
  if (!(this instanceof Extract)) return new Extract(opts)
  Writable$3.call(this, opts);

  opts = opts || {};

  this._offset = 0;
  this._buffer = bl();
  this._missing = 0;
  this._partial = false;
  this._onparse = noop$3;
  this._header = null;
  this._stream = null;
  this._overflow = null;
  this._cb = null;
  this._locked = false;
  this._destroyed = false;
  this._pax = null;
  this._paxGlobal = null;
  this._gnuLongPath = null;
  this._gnuLongLinkPath = null;

  var self = this;
  var b = self._buffer;

  var oncontinue = function () {
    self._continue();
  };

  var onunlock = function (err) {
    self._locked = false;
    if (err) return self.destroy(err)
    if (!self._stream) oncontinue();
  };

  var onstreamend = function () {
    self._stream = null;
    var drain = overflow$1(self._header.size);
    if (drain) self._parse(drain, ondrain);
    else self._parse(512, onheader);
    if (!self._locked) oncontinue();
  };

  var ondrain = function () {
    self._buffer.consume(overflow$1(self._header.size));
    self._parse(512, onheader);
    oncontinue();
  };

  var onpaxglobalheader = function () {
    var size = self._header.size;
    self._paxGlobal = headers$1.decodePax(b.slice(0, size));
    b.consume(size);
    onstreamend();
  };

  var onpaxheader = function () {
    var size = self._header.size;
    self._pax = headers$1.decodePax(b.slice(0, size));
    if (self._paxGlobal) self._pax = xtend(self._paxGlobal, self._pax);
    b.consume(size);
    onstreamend();
  };

  var ongnulongpath = function () {
    var size = self._header.size;
    this._gnuLongPath = headers$1.decodeLongPath(b.slice(0, size), opts.filenameEncoding);
    b.consume(size);
    onstreamend();
  };

  var ongnulonglinkpath = function () {
    var size = self._header.size;
    this._gnuLongLinkPath = headers$1.decodeLongPath(b.slice(0, size), opts.filenameEncoding);
    b.consume(size);
    onstreamend();
  };

  var onheader = function () {
    var offset = self._offset;
    var header;
    try {
      header = self._header = headers$1.decode(b.slice(0, 512), opts.filenameEncoding);
    } catch (err) {
      self.emit('error', err);
    }
    b.consume(512);

    if (!header) {
      self._parse(512, onheader);
      oncontinue();
      return
    }
    if (header.type === 'gnu-long-path') {
      self._parse(header.size, ongnulongpath);
      oncontinue();
      return
    }
    if (header.type === 'gnu-long-link-path') {
      self._parse(header.size, ongnulonglinkpath);
      oncontinue();
      return
    }
    if (header.type === 'pax-global-header') {
      self._parse(header.size, onpaxglobalheader);
      oncontinue();
      return
    }
    if (header.type === 'pax-header') {
      self._parse(header.size, onpaxheader);
      oncontinue();
      return
    }

    if (self._gnuLongPath) {
      header.name = self._gnuLongPath;
      self._gnuLongPath = null;
    }

    if (self._gnuLongLinkPath) {
      header.linkname = self._gnuLongLinkPath;
      self._gnuLongLinkPath = null;
    }

    if (self._pax) {
      self._header = header = mixinPax(header, self._pax);
      self._pax = null;
    }

    self._locked = true;

    if (!header.size || header.type === 'directory') {
      self._parse(512, onheader);
      self.emit('entry', header, emptyStream(self, offset), onunlock);
      return
    }

    self._stream = new Source(self, offset);

    self.emit('entry', header, self._stream, onunlock);
    self._parse(header.size, onstreamend);
    oncontinue();
  };

  this._onheader = onheader;
  this._parse(512, onheader);
};

util$4.inherits(Extract, Writable$3);

Extract.prototype.destroy = function (err) {
  if (this._destroyed) return
  this._destroyed = true;

  if (err) this.emit('error', err);
  this.emit('close');
  if (this._stream) this._stream.emit('close');
};

Extract.prototype._parse = function (size, onparse) {
  if (this._destroyed) return
  this._offset += size;
  this._missing = size;
  if (onparse === this._onheader) this._partial = false;
  this._onparse = onparse;
};

Extract.prototype._continue = function () {
  if (this._destroyed) return
  var cb = this._cb;
  this._cb = noop$3;
  if (this._overflow) this._write(this._overflow, undefined, cb);
  else cb();
};

Extract.prototype._write = function (data, enc, cb) {
  if (this._destroyed) return

  var s = this._stream;
  var b = this._buffer;
  var missing = this._missing;
  if (data.length) this._partial = true;

  // we do not reach end-of-chunk now. just forward it

  if (data.length < missing) {
    this._missing -= data.length;
    this._overflow = null;
    if (s) return s.write(data, cb)
    b.append(data);
    return cb()
  }

  // end-of-chunk. the parser should call cb.

  this._cb = cb;
  this._missing = 0;

  var overflow = null;
  if (data.length > missing) {
    overflow = data.slice(missing);
    data = data.slice(0, missing);
  }

  if (s) s.end(data);
  else b.append(data);

  this._overflow = overflow;
  this._onparse();
};

Extract.prototype._final = function (cb) {
  if (this._partial) return this.destroy(new Error('Unexpected end of data'))
  cb();
};

var extract$1 = Extract;

var fsConstants = require$$0$3.constants || require$$0$9;

var once$1 = {exports: {}};

var wrappy_1;
var hasRequiredWrappy;

function requireWrappy () {
	if (hasRequiredWrappy) return wrappy_1;
	hasRequiredWrappy = 1;
	// Returns a wrapper function that returns a wrapped callback
	// The wrapper function should do some stuff, and return a
	// presumably different callback function.
	// This makes sure that own properties are retained, so that
	// decorations and such are not lost along the way.
	wrappy_1 = wrappy;
	function wrappy (fn, cb) {
	  if (fn && cb) return wrappy(fn)(cb)

	  if (typeof fn !== 'function')
	    throw new TypeError('need wrapper function')

	  Object.keys(fn).forEach(function (k) {
	    wrapper[k] = fn[k];
	  });

	  return wrapper

	  function wrapper() {
	    var args = new Array(arguments.length);
	    for (var i = 0; i < args.length; i++) {
	      args[i] = arguments[i];
	    }
	    var ret = fn.apply(this, args);
	    var cb = args[args.length-1];
	    if (typeof ret === 'function' && ret !== cb) {
	      Object.keys(cb).forEach(function (k) {
	        ret[k] = cb[k];
	      });
	    }
	    return ret
	  }
	}
	return wrappy_1;
}

var hasRequiredOnce;

function requireOnce () {
	if (hasRequiredOnce) return once$1.exports;
	hasRequiredOnce = 1;
	var wrappy = requireWrappy();
	once$1.exports = wrappy(once);
	once$1.exports.strict = wrappy(onceStrict);

	once.proto = once(function () {
	  Object.defineProperty(Function.prototype, 'once', {
	    value: function () {
	      return once(this)
	    },
	    configurable: true
	  });

	  Object.defineProperty(Function.prototype, 'onceStrict', {
	    value: function () {
	      return onceStrict(this)
	    },
	    configurable: true
	  });
	});

	function once (fn) {
	  var f = function () {
	    if (f.called) return f.value
	    f.called = true;
	    return f.value = fn.apply(this, arguments)
	  };
	  f.called = false;
	  return f
	}

	function onceStrict (fn) {
	  var f = function () {
	    if (f.called)
	      throw new Error(f.onceError)
	    f.called = true;
	    return f.value = fn.apply(this, arguments)
	  };
	  var name = fn.name || 'Function wrapped with `once`';
	  f.onceError = name + " shouldn't be called more than once";
	  f.called = false;
	  return f
	}
	return once$1.exports;
}

var once = requireOnce();

var noop$2 = function() {};

var isRequest = function(stream) {
	return stream.setHeader && typeof stream.abort === 'function';
};

var isChildProcess = function(stream) {
	return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3
};

var eos$1 = function(stream, opts, callback) {
	if (typeof opts === 'function') return eos$1(stream, null, opts);
	if (!opts) opts = {};

	callback = once(callback || noop$2);

	var ws = stream._writableState;
	var rs = stream._readableState;
	var readable = opts.readable || (opts.readable !== false && stream.readable);
	var writable = opts.writable || (opts.writable !== false && stream.writable);
	var cancelled = false;

	var onlegacyfinish = function() {
		if (!stream.writable) onfinish();
	};

	var onfinish = function() {
		writable = false;
		if (!readable) callback.call(stream);
	};

	var onend = function() {
		readable = false;
		if (!writable) callback.call(stream);
	};

	var onexit = function(exitCode) {
		callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
	};

	var onerror = function(err) {
		callback.call(stream, err);
	};

	var onclose = function() {
		process.nextTick(onclosenexttick);
	};

	var onclosenexttick = function() {
		if (cancelled) return;
		if (readable && !(rs && (rs.ended && !rs.destroyed))) return callback.call(stream, new Error('premature close'));
		if (writable && !(ws && (ws.ended && !ws.destroyed))) return callback.call(stream, new Error('premature close'));
	};

	var onrequest = function() {
		stream.req.on('finish', onfinish);
	};

	if (isRequest(stream)) {
		stream.on('complete', onfinish);
		stream.on('abort', onclose);
		if (stream.req) onrequest();
		else stream.on('request', onrequest);
	} else if (writable && !ws) { // legacy streams
		stream.on('end', onlegacyfinish);
		stream.on('close', onlegacyfinish);
	}

	if (isChildProcess(stream)) stream.on('exit', onexit);

	stream.on('end', onend);
	stream.on('finish', onfinish);
	if (opts.error !== false) stream.on('error', onerror);
	stream.on('close', onclose);

	return function() {
		cancelled = true;
		stream.removeListener('complete', onfinish);
		stream.removeListener('abort', onclose);
		stream.removeListener('request', onrequest);
		if (stream.req) stream.req.removeListener('finish', onfinish);
		stream.removeListener('end', onlegacyfinish);
		stream.removeListener('close', onlegacyfinish);
		stream.removeListener('finish', onfinish);
		stream.removeListener('exit', onexit);
		stream.removeListener('end', onend);
		stream.removeListener('error', onerror);
		stream.removeListener('close', onclose);
	};
};

var endOfStream = eos$1;

var constants = fsConstants;
var eos = endOfStream;
var util$3 = require$$0$8;
var alloc = bufferAlloc;
var toBuffer = toBuffer_1;

var Readable$3 = readableExports.Readable;
var Writable$2 = readableExports.Writable;
var StringDecoder = require$$6.StringDecoder;

var headers = headers$2;

var DMODE = parseInt('755', 8);
var FMODE = parseInt('644', 8);

var END_OF_TAR = alloc(1024);

var noop$1 = function () {};

var overflow = function (self, size) {
  size &= 511;
  if (size) self.push(END_OF_TAR.slice(0, 512 - size));
};

function modeToType (mode) {
  switch (mode & constants.S_IFMT) {
    case constants.S_IFBLK: return 'block-device'
    case constants.S_IFCHR: return 'character-device'
    case constants.S_IFDIR: return 'directory'
    case constants.S_IFIFO: return 'fifo'
    case constants.S_IFLNK: return 'symlink'
  }

  return 'file'
}

var Sink = function (to) {
  Writable$2.call(this);
  this.written = 0;
  this._to = to;
  this._destroyed = false;
};

util$3.inherits(Sink, Writable$2);

Sink.prototype._write = function (data, enc, cb) {
  this.written += data.length;
  if (this._to.push(data)) return cb()
  this._to._drain = cb;
};

Sink.prototype.destroy = function () {
  if (this._destroyed) return
  this._destroyed = true;
  this.emit('close');
};

var LinkSink = function () {
  Writable$2.call(this);
  this.linkname = '';
  this._decoder = new StringDecoder('utf-8');
  this._destroyed = false;
};

util$3.inherits(LinkSink, Writable$2);

LinkSink.prototype._write = function (data, enc, cb) {
  this.linkname += this._decoder.write(data);
  cb();
};

LinkSink.prototype.destroy = function () {
  if (this._destroyed) return
  this._destroyed = true;
  this.emit('close');
};

var Void = function () {
  Writable$2.call(this);
  this._destroyed = false;
};

util$3.inherits(Void, Writable$2);

Void.prototype._write = function (data, enc, cb) {
  cb(new Error('No body allowed for this entry'));
};

Void.prototype.destroy = function () {
  if (this._destroyed) return
  this._destroyed = true;
  this.emit('close');
};

var Pack = function (opts) {
  if (!(this instanceof Pack)) return new Pack(opts)
  Readable$3.call(this, opts);

  this._drain = noop$1;
  this._finalized = false;
  this._finalizing = false;
  this._destroyed = false;
  this._stream = null;
};

util$3.inherits(Pack, Readable$3);

Pack.prototype.entry = function (header, buffer, callback) {
  if (this._stream) throw new Error('already piping an entry')
  if (this._finalized || this._destroyed) return

  if (typeof buffer === 'function') {
    callback = buffer;
    buffer = null;
  }

  if (!callback) callback = noop$1;

  var self = this;

  if (!header.size || header.type === 'symlink') header.size = 0;
  if (!header.type) header.type = modeToType(header.mode);
  if (!header.mode) header.mode = header.type === 'directory' ? DMODE : FMODE;
  if (!header.uid) header.uid = 0;
  if (!header.gid) header.gid = 0;
  if (!header.mtime) header.mtime = new Date();

  if (typeof buffer === 'string') buffer = toBuffer(buffer);
  if (Buffer.isBuffer(buffer)) {
    header.size = buffer.length;
    this._encode(header);
    this.push(buffer);
    overflow(self, header.size);
    process.nextTick(callback);
    return new Void()
  }

  if (header.type === 'symlink' && !header.linkname) {
    var linkSink = new LinkSink();
    eos(linkSink, function (err) {
      if (err) { // stream was closed
        self.destroy();
        return callback(err)
      }

      header.linkname = linkSink.linkname;
      self._encode(header);
      callback();
    });

    return linkSink
  }

  this._encode(header);

  if (header.type !== 'file' && header.type !== 'contiguous-file') {
    process.nextTick(callback);
    return new Void()
  }

  var sink = new Sink(this);

  this._stream = sink;

  eos(sink, function (err) {
    self._stream = null;

    if (err) { // stream was closed
      self.destroy();
      return callback(err)
    }

    if (sink.written !== header.size) { // corrupting tar
      self.destroy();
      return callback(new Error('size mismatch'))
    }

    overflow(self, header.size);
    if (self._finalizing) self.finalize();
    callback();
  });

  return sink
};

Pack.prototype.finalize = function () {
  if (this._stream) {
    this._finalizing = true;
    return
  }

  if (this._finalized) return
  this._finalized = true;
  this.push(END_OF_TAR);
  this.push(null);
};

Pack.prototype.destroy = function (err) {
  if (this._destroyed) return
  this._destroyed = true;

  if (err) this.emit('error', err);
  this.emit('close');
  if (this._stream && this._stream.destroy) this._stream.destroy();
};

Pack.prototype._encode = function (header) {
  if (!header.pax) {
    var buf = headers.encode(header);
    if (buf) {
      this.push(buf);
      return
    }
  }
  this._encodePax(header);
};

Pack.prototype._encodePax = function (header) {
  var paxHeader = headers.encodePax({
    name: header.name,
    linkname: header.linkname,
    pax: header.pax
  });

  var newHeader = {
    name: 'PaxHeader',
    mode: header.mode,
    uid: header.uid,
    gid: header.gid,
    size: paxHeader.length,
    mtime: header.mtime,
    type: 'pax-header',
    linkname: header.linkname && 'PaxHeader',
    uname: header.uname,
    gname: header.gname,
    devmajor: header.devmajor,
    devminor: header.devminor
  };

  this.push(headers.encode(newHeader));
  this.push(paxHeader);
  overflow(this, paxHeader.length);

  newHeader.size = header.size;
  newHeader.type = header.type;
  this.push(headers.encode(newHeader));
};

Pack.prototype._read = function (n) {
  var drain = this._drain;
  this._drain = noop$1;
  drain();
};

var pack = Pack;

tarStream$1.extract = extract$1;
tarStream$1.pack = pack;

const fileType$7 = fileType$8;
const isStream$2 = isStreamExports;
const tarStream = tarStream$1;

var decompressTar$3 = () => input => {
	if (!Buffer.isBuffer(input) && !isStream$2(input)) {
		return Promise.reject(new TypeError(`Expected a Buffer or Stream, got ${typeof input}`));
	}

	if (Buffer.isBuffer(input) && (!fileType$7(input) || fileType$7(input).ext !== 'tar')) {
		return Promise.resolve([]);
	}

	const extract = tarStream.extract();
	const files = [];

	extract.on('entry', (header, stream, cb) => {
		const chunk = [];

		stream.on('data', data => chunk.push(data));
		stream.on('end', () => {
			const file = {
				data: Buffer.concat(chunk),
				mode: header.mode,
				mtime: header.mtime,
				path: header.name,
				type: header.type
			};

			if (header.type === 'symlink' || header.type === 'link') {
				file.linkname = header.linkname;
			}

			files.push(file);
			cb();
		});
	});

	const promise = new Promise((resolve, reject) => {
		if (!Buffer.isBuffer(input)) {
			input.on('error', reject);
		}

		extract.on('finish', () => resolve(files));
		extract.on('error', reject);
	});

	extract.then = promise.then.bind(promise);
	extract.catch = promise.catch.bind(promise);

	if (Buffer.isBuffer(input)) {
		extract.end(input);
	} else {
		input.pipe(extract);
	}

	return extract;
};

const toBytes$1 = s => Array.from(s).map(c => c.charCodeAt(0));
const xpiZipFilename$1 = toBytes$1('META-INF/mozilla.rsa');
const oxmlContentTypes$1 = toBytes$1('[Content_Types].xml');
const oxmlRels$1 = toBytes$1('_rels/.rels');

var fileType$6 = input => {
	const buf = new Uint8Array(input);

	if (!(buf && buf.length > 1)) {
		return null;
	}

	const check = (header, opts) => {
		opts = Object.assign({
			offset: 0
		}, opts);

		for (let i = 0; i < header.length; i++) {
			// If a bitmask is set
			if (opts.mask) {
				// If header doesn't equal `buf` with bits masked off
				if (header[i] !== (opts.mask[i] & buf[i + opts.offset])) {
					return false;
				}
			} else if (header[i] !== buf[i + opts.offset]) {
				return false;
			}
		}

		return true;
	};

	if (check([0xFF, 0xD8, 0xFF])) {
		return {
			ext: 'jpg',
			mime: 'image/jpeg'
		};
	}

	if (check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
		return {
			ext: 'png',
			mime: 'image/png'
		};
	}

	if (check([0x47, 0x49, 0x46])) {
		return {
			ext: 'gif',
			mime: 'image/gif'
		};
	}

	if (check([0x57, 0x45, 0x42, 0x50], {offset: 8})) {
		return {
			ext: 'webp',
			mime: 'image/webp'
		};
	}

	if (check([0x46, 0x4C, 0x49, 0x46])) {
		return {
			ext: 'flif',
			mime: 'image/flif'
		};
	}

	// Needs to be before `tif` check
	if (
		(check([0x49, 0x49, 0x2A, 0x0]) || check([0x4D, 0x4D, 0x0, 0x2A])) &&
		check([0x43, 0x52], {offset: 8})
	) {
		return {
			ext: 'cr2',
			mime: 'image/x-canon-cr2'
		};
	}

	if (
		check([0x49, 0x49, 0x2A, 0x0]) ||
		check([0x4D, 0x4D, 0x0, 0x2A])
	) {
		return {
			ext: 'tif',
			mime: 'image/tiff'
		};
	}

	if (check([0x42, 0x4D])) {
		return {
			ext: 'bmp',
			mime: 'image/bmp'
		};
	}

	if (check([0x49, 0x49, 0xBC])) {
		return {
			ext: 'jxr',
			mime: 'image/vnd.ms-photo'
		};
	}

	if (check([0x38, 0x42, 0x50, 0x53])) {
		return {
			ext: 'psd',
			mime: 'image/vnd.adobe.photoshop'
		};
	}

	// Zip-based file formats
	// Need to be before the `zip` check
	if (check([0x50, 0x4B, 0x3, 0x4])) {
		if (
			check([0x6D, 0x69, 0x6D, 0x65, 0x74, 0x79, 0x70, 0x65, 0x61, 0x70, 0x70, 0x6C, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6F, 0x6E, 0x2F, 0x65, 0x70, 0x75, 0x62, 0x2B, 0x7A, 0x69, 0x70], {offset: 30})
		) {
			return {
				ext: 'epub',
				mime: 'application/epub+zip'
			};
		}

		// Assumes signed `.xpi` from addons.mozilla.org
		if (check(xpiZipFilename$1, {offset: 30})) {
			return {
				ext: 'xpi',
				mime: 'application/x-xpinstall'
			};
		}

		// https://github.com/file/file/blob/master/magic/Magdir/msooxml
		if (check(oxmlContentTypes$1, {offset: 30}) || check(oxmlRels$1, {offset: 30})) {
			const sliced = buf.subarray(4, 4 + 2000);
			const nextZipHeaderIndex = arr => arr.findIndex((el, i, arr) => arr[i] === 0x50 && arr[i + 1] === 0x4B && arr[i + 2] === 0x3 && arr[i + 3] === 0x4);
			const header2Pos = nextZipHeaderIndex(sliced);

			if (header2Pos !== -1) {
				const slicedAgain = buf.subarray(header2Pos + 8, header2Pos + 8 + 1000);
				const header3Pos = nextZipHeaderIndex(slicedAgain);

				if (header3Pos !== -1) {
					const offset = 8 + header2Pos + header3Pos + 30;

					if (check(toBytes$1('word/'), {offset})) {
						return {
							ext: 'docx',
							mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
						};
					}

					if (check(toBytes$1('ppt/'), {offset})) {
						return {
							ext: 'pptx',
							mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
						};
					}

					if (check(toBytes$1('xl/'), {offset})) {
						return {
							ext: 'xlsx',
							mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
						};
					}
				}
			}
		}
	}

	if (
		check([0x50, 0x4B]) &&
		(buf[2] === 0x3 || buf[2] === 0x5 || buf[2] === 0x7) &&
		(buf[3] === 0x4 || buf[3] === 0x6 || buf[3] === 0x8)
	) {
		return {
			ext: 'zip',
			mime: 'application/zip'
		};
	}

	if (check([0x75, 0x73, 0x74, 0x61, 0x72], {offset: 257})) {
		return {
			ext: 'tar',
			mime: 'application/x-tar'
		};
	}

	if (
		check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x7]) &&
		(buf[6] === 0x0 || buf[6] === 0x1)
	) {
		return {
			ext: 'rar',
			mime: 'application/x-rar-compressed'
		};
	}

	if (check([0x1F, 0x8B, 0x8])) {
		return {
			ext: 'gz',
			mime: 'application/gzip'
		};
	}

	if (check([0x42, 0x5A, 0x68])) {
		return {
			ext: 'bz2',
			mime: 'application/x-bzip2'
		};
	}

	if (check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C])) {
		return {
			ext: '7z',
			mime: 'application/x-7z-compressed'
		};
	}

	if (check([0x78, 0x01])) {
		return {
			ext: 'dmg',
			mime: 'application/x-apple-diskimage'
		};
	}

	if (check([0x33, 0x67, 0x70, 0x35]) || // 3gp5
		(
			check([0x0, 0x0, 0x0]) && check([0x66, 0x74, 0x79, 0x70], {offset: 4}) &&
				(
					check([0x6D, 0x70, 0x34, 0x31], {offset: 8}) || // MP41
					check([0x6D, 0x70, 0x34, 0x32], {offset: 8}) || // MP42
					check([0x69, 0x73, 0x6F, 0x6D], {offset: 8}) || // ISOM
					check([0x69, 0x73, 0x6F, 0x32], {offset: 8}) || // ISO2
					check([0x6D, 0x6D, 0x70, 0x34], {offset: 8}) || // MMP4
					check([0x4D, 0x34, 0x56], {offset: 8}) || // M4V
					check([0x64, 0x61, 0x73, 0x68], {offset: 8}) // DASH
				)
		)) {
		return {
			ext: 'mp4',
			mime: 'video/mp4'
		};
	}

	if (check([0x4D, 0x54, 0x68, 0x64])) {
		return {
			ext: 'mid',
			mime: 'audio/midi'
		};
	}

	// https://github.com/threatstack/libmagic/blob/master/magic/Magdir/matroska
	if (check([0x1A, 0x45, 0xDF, 0xA3])) {
		const sliced = buf.subarray(4, 4 + 4096);
		const idPos = sliced.findIndex((el, i, arr) => arr[i] === 0x42 && arr[i + 1] === 0x82);

		if (idPos !== -1) {
			const docTypePos = idPos + 3;
			const findDocType = type => Array.from(type).every((c, i) => sliced[docTypePos + i] === c.charCodeAt(0));

			if (findDocType('matroska')) {
				return {
					ext: 'mkv',
					mime: 'video/x-matroska'
				};
			}

			if (findDocType('webm')) {
				return {
					ext: 'webm',
					mime: 'video/webm'
				};
			}
		}
	}

	if (check([0x0, 0x0, 0x0, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20]) ||
		check([0x66, 0x72, 0x65, 0x65], {offset: 4}) ||
		check([0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20], {offset: 4}) ||
		check([0x6D, 0x64, 0x61, 0x74], {offset: 4}) || // MJPEG
		check([0x77, 0x69, 0x64, 0x65], {offset: 4})) {
		return {
			ext: 'mov',
			mime: 'video/quicktime'
		};
	}

	if (
		check([0x52, 0x49, 0x46, 0x46]) &&
		check([0x41, 0x56, 0x49], {offset: 8})
	) {
		return {
			ext: 'avi',
			mime: 'video/x-msvideo'
		};
	}

	if (check([0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9])) {
		return {
			ext: 'wmv',
			mime: 'video/x-ms-wmv'
		};
	}

	if (check([0x0, 0x0, 0x1, 0xBA])) {
		return {
			ext: 'mpg',
			mime: 'video/mpeg'
		};
	}

	// Check for MP3 header at different starting offsets
	for (let start = 0; start < 2 && start < (buf.length - 16); start++) {
		if (
			check([0x49, 0x44, 0x33], {offset: start}) || // ID3 header
			check([0xFF, 0xE2], {offset: start, mask: [0xFF, 0xE2]}) // MPEG 1 or 2 Layer 3 header
		) {
			return {
				ext: 'mp3',
				mime: 'audio/mpeg'
			};
		}
	}

	if (
		check([0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x41], {offset: 4}) ||
		check([0x4D, 0x34, 0x41, 0x20])
	) {
		return {
			ext: 'm4a',
			mime: 'audio/m4a'
		};
	}

	// Needs to be before `ogg` check
	if (check([0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64], {offset: 28})) {
		return {
			ext: 'opus',
			mime: 'audio/opus'
		};
	}

	if (check([0x4F, 0x67, 0x67, 0x53])) {
		return {
			ext: 'ogg',
			mime: 'audio/ogg'
		};
	}

	if (check([0x66, 0x4C, 0x61, 0x43])) {
		return {
			ext: 'flac',
			mime: 'audio/x-flac'
		};
	}

	if (
		check([0x52, 0x49, 0x46, 0x46]) &&
		check([0x57, 0x41, 0x56, 0x45], {offset: 8})
	) {
		return {
			ext: 'wav',
			mime: 'audio/x-wav'
		};
	}

	if (check([0x23, 0x21, 0x41, 0x4D, 0x52, 0x0A])) {
		return {
			ext: 'amr',
			mime: 'audio/amr'
		};
	}

	if (check([0x25, 0x50, 0x44, 0x46])) {
		return {
			ext: 'pdf',
			mime: 'application/pdf'
		};
	}

	if (check([0x4D, 0x5A])) {
		return {
			ext: 'exe',
			mime: 'application/x-msdownload'
		};
	}

	if (
		(buf[0] === 0x43 || buf[0] === 0x46) &&
		check([0x57, 0x53], {offset: 1})
	) {
		return {
			ext: 'swf',
			mime: 'application/x-shockwave-flash'
		};
	}

	if (check([0x7B, 0x5C, 0x72, 0x74, 0x66])) {
		return {
			ext: 'rtf',
			mime: 'application/rtf'
		};
	}

	if (check([0x00, 0x61, 0x73, 0x6D])) {
		return {
			ext: 'wasm',
			mime: 'application/wasm'
		};
	}

	if (
		check([0x77, 0x4F, 0x46, 0x46]) &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			check([0x4F, 0x54, 0x54, 0x4F], {offset: 4})
		)
	) {
		return {
			ext: 'woff',
			mime: 'font/woff'
		};
	}

	if (
		check([0x77, 0x4F, 0x46, 0x32]) &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			check([0x4F, 0x54, 0x54, 0x4F], {offset: 4})
		)
	) {
		return {
			ext: 'woff2',
			mime: 'font/woff2'
		};
	}

	if (
		check([0x4C, 0x50], {offset: 34}) &&
		(
			check([0x00, 0x00, 0x01], {offset: 8}) ||
			check([0x01, 0x00, 0x02], {offset: 8}) ||
			check([0x02, 0x00, 0x02], {offset: 8})
		)
	) {
		return {
			ext: 'eot',
			mime: 'application/octet-stream'
		};
	}

	if (check([0x00, 0x01, 0x00, 0x00, 0x00])) {
		return {
			ext: 'ttf',
			mime: 'font/ttf'
		};
	}

	if (check([0x4F, 0x54, 0x54, 0x4F, 0x00])) {
		return {
			ext: 'otf',
			mime: 'font/otf'
		};
	}

	if (check([0x00, 0x00, 0x01, 0x00])) {
		return {
			ext: 'ico',
			mime: 'image/x-icon'
		};
	}

	if (check([0x46, 0x4C, 0x56, 0x01])) {
		return {
			ext: 'flv',
			mime: 'video/x-flv'
		};
	}

	if (check([0x25, 0x21])) {
		return {
			ext: 'ps',
			mime: 'application/postscript'
		};
	}

	if (check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00])) {
		return {
			ext: 'xz',
			mime: 'application/x-xz'
		};
	}

	if (check([0x53, 0x51, 0x4C, 0x69])) {
		return {
			ext: 'sqlite',
			mime: 'application/x-sqlite3'
		};
	}

	if (check([0x4E, 0x45, 0x53, 0x1A])) {
		return {
			ext: 'nes',
			mime: 'application/x-nintendo-nes-rom'
		};
	}

	if (check([0x43, 0x72, 0x32, 0x34])) {
		return {
			ext: 'crx',
			mime: 'application/x-google-chrome-extension'
		};
	}

	if (
		check([0x4D, 0x53, 0x43, 0x46]) ||
		check([0x49, 0x53, 0x63, 0x28])
	) {
		return {
			ext: 'cab',
			mime: 'application/vnd.ms-cab-compressed'
		};
	}

	// Needs to be before `ar` check
	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E, 0x0A, 0x64, 0x65, 0x62, 0x69, 0x61, 0x6E, 0x2D, 0x62, 0x69, 0x6E, 0x61, 0x72, 0x79])) {
		return {
			ext: 'deb',
			mime: 'application/x-deb'
		};
	}

	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E])) {
		return {
			ext: 'ar',
			mime: 'application/x-unix-archive'
		};
	}

	if (check([0xED, 0xAB, 0xEE, 0xDB])) {
		return {
			ext: 'rpm',
			mime: 'application/x-rpm'
		};
	}

	if (
		check([0x1F, 0xA0]) ||
		check([0x1F, 0x9D])
	) {
		return {
			ext: 'Z',
			mime: 'application/x-compress'
		};
	}

	if (check([0x4C, 0x5A, 0x49, 0x50])) {
		return {
			ext: 'lz',
			mime: 'application/x-lzip'
		};
	}

	if (check([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
		return {
			ext: 'msi',
			mime: 'application/x-msi'
		};
	}

	if (check([0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02])) {
		return {
			ext: 'mxf',
			mime: 'application/mxf'
		};
	}

	if (check([0x47], {offset: 4}) && (check([0x47], {offset: 192}) || check([0x47], {offset: 196}))) {
		return {
			ext: 'mts',
			mime: 'video/mp2t'
		};
	}

	if (check([0x42, 0x4C, 0x45, 0x4E, 0x44, 0x45, 0x52])) {
		return {
			ext: 'blend',
			mime: 'application/x-blender'
		};
	}

	if (check([0x42, 0x50, 0x47, 0xFB])) {
		return {
			ext: 'bpg',
			mime: 'image/bpg'
		};
	}

	return null;
};

/*
node-bzip - a pure-javascript Node.JS module for decoding bzip2 data

Copyright (C) 2012 Eli Skeggs

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Adapted from bzip2.js, copyright 2011 antimatter15 (antimatter15@gmail.com).

Based on micro-bunzip by Rob Landley (rob@landley.net).

Based on bzip2 decompression code by Julian R Seward (jseward@acm.org),
which also acknowledges contributions by Mike Burrows, David Wheeler,
Peter Fenwick, Alistair Moffat, Radford Neal, Ian H. Witten,
Robert Sedgewick, and Jon L. Bentley.
*/

var BITMASK$1 = [0x00, 0x01, 0x03, 0x07, 0x0F, 0x1F, 0x3F, 0x7F, 0xFF];

// offset in bytes
var BitReader$1 = function(stream) {
  this.stream = stream;
  this.bitOffset = 0;
  this.curByte = 0;
  this.hasByte = false;
};

BitReader$1.prototype._ensureByte = function() {
  if (!this.hasByte) {
    this.curByte = this.stream.readByte();
    this.hasByte = true;
  }
};

// reads bits from the buffer
BitReader$1.prototype.read = function(bits) {
  var result = 0;
  while (bits > 0) {
    this._ensureByte();
    var remaining = 8 - this.bitOffset;
    // if we're in a byte
    if (bits >= remaining) {
      result <<= remaining;
      result |= BITMASK$1[remaining] & this.curByte;
      this.hasByte = false;
      this.bitOffset = 0;
      bits -= remaining;
    } else {
      result <<= bits;
      var shift = remaining - bits;
      result |= (this.curByte & (BITMASK$1[bits] << shift)) >> shift;
      this.bitOffset += bits;
      bits = 0;
    }
  }
  return result;
};

// seek to an arbitrary point in the buffer (expressed in bits)
BitReader$1.prototype.seek = function(pos) {
  var n_bit = pos % 8;
  var n_byte = (pos - n_bit) / 8;
  this.bitOffset = n_bit;
  this.stream.seek(n_byte);
  this.hasByte = false;
};

// reads 6 bytes worth of data using the read method
BitReader$1.prototype.pi = function() {
  var buf = new Buffer(6), i;
  for (i = 0; i < buf.length; i++) {
    buf[i] = this.read(8);
  }
  return buf.toString('hex');
};

var bitreader = BitReader$1;

/* very simple input/output stream interface */

var Stream$2 = function() {
};

// input streams //////////////
/** Returns the next byte, or -1 for EOF. */
Stream$2.prototype.readByte = function() {
  throw new Error("abstract method readByte() not implemented");
};
/** Attempts to fill the buffer; returns number of bytes read, or
 *  -1 for EOF. */
Stream$2.prototype.read = function(buffer, bufOffset, length) {
  var bytesRead = 0;
  while (bytesRead < length) {
    var c = this.readByte();
    if (c < 0) { // EOF
      return (bytesRead===0) ? -1 : bytesRead;
    }
    buffer[bufOffset++] = c;
    bytesRead++;
  }
  return bytesRead;
};
Stream$2.prototype.seek = function(new_pos) {
  throw new Error("abstract method seek() not implemented");
};

// output streams ///////////
Stream$2.prototype.writeByte = function(_byte) {
  throw new Error("abstract method readByte() not implemented");
};
Stream$2.prototype.write = function(buffer, bufOffset, length) {
  var i;
  for (i=0; i<length; i++) {
    this.writeByte(buffer[bufOffset++]);
  }
  return length;
};
Stream$2.prototype.flush = function() {
};

var stream$2 = Stream$2;

/* CRC32, used in Bzip2 implementation.
 * This is a port of CRC32.java from the jbzip2 implementation at
 *   https://code.google.com/p/jbzip2
 * which is:
 *   Copyright (c) 2011 Matthew Francis
 *
 *   Permission is hereby granted, free of charge, to any person
 *   obtaining a copy of this software and associated documentation
 *   files (the "Software"), to deal in the Software without
 *   restriction, including without limitation the rights to use,
 *   copy, modify, merge, publish, distribute, sublicense, and/or sell
 *   copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the following
 *   conditions:
 *
 *   The above copyright notice and this permission notice shall be
 *   included in all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *   EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 *   OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *   NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 *   HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 *   WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 *   OTHER DEALINGS IN THE SOFTWARE.
 * This JavaScript implementation is:
 *   Copyright (c) 2013 C. Scott Ananian
 * with the same licensing terms as Matthew Francis' original implementation.
 */

var crc32$2 = (function() {

  /**
   * A static CRC lookup table
   */
  var crc32Lookup = new Uint32Array([
    0x00000000, 0x04c11db7, 0x09823b6e, 0x0d4326d9, 0x130476dc, 0x17c56b6b, 0x1a864db2, 0x1e475005,
    0x2608edb8, 0x22c9f00f, 0x2f8ad6d6, 0x2b4bcb61, 0x350c9b64, 0x31cd86d3, 0x3c8ea00a, 0x384fbdbd,
    0x4c11db70, 0x48d0c6c7, 0x4593e01e, 0x4152fda9, 0x5f15adac, 0x5bd4b01b, 0x569796c2, 0x52568b75,
    0x6a1936c8, 0x6ed82b7f, 0x639b0da6, 0x675a1011, 0x791d4014, 0x7ddc5da3, 0x709f7b7a, 0x745e66cd,
    0x9823b6e0, 0x9ce2ab57, 0x91a18d8e, 0x95609039, 0x8b27c03c, 0x8fe6dd8b, 0x82a5fb52, 0x8664e6e5,
    0xbe2b5b58, 0xbaea46ef, 0xb7a96036, 0xb3687d81, 0xad2f2d84, 0xa9ee3033, 0xa4ad16ea, 0xa06c0b5d,
    0xd4326d90, 0xd0f37027, 0xddb056fe, 0xd9714b49, 0xc7361b4c, 0xc3f706fb, 0xceb42022, 0xca753d95,
    0xf23a8028, 0xf6fb9d9f, 0xfbb8bb46, 0xff79a6f1, 0xe13ef6f4, 0xe5ffeb43, 0xe8bccd9a, 0xec7dd02d,
    0x34867077, 0x30476dc0, 0x3d044b19, 0x39c556ae, 0x278206ab, 0x23431b1c, 0x2e003dc5, 0x2ac12072,
    0x128e9dcf, 0x164f8078, 0x1b0ca6a1, 0x1fcdbb16, 0x018aeb13, 0x054bf6a4, 0x0808d07d, 0x0cc9cdca,
    0x7897ab07, 0x7c56b6b0, 0x71159069, 0x75d48dde, 0x6b93dddb, 0x6f52c06c, 0x6211e6b5, 0x66d0fb02,
    0x5e9f46bf, 0x5a5e5b08, 0x571d7dd1, 0x53dc6066, 0x4d9b3063, 0x495a2dd4, 0x44190b0d, 0x40d816ba,
    0xaca5c697, 0xa864db20, 0xa527fdf9, 0xa1e6e04e, 0xbfa1b04b, 0xbb60adfc, 0xb6238b25, 0xb2e29692,
    0x8aad2b2f, 0x8e6c3698, 0x832f1041, 0x87ee0df6, 0x99a95df3, 0x9d684044, 0x902b669d, 0x94ea7b2a,
    0xe0b41de7, 0xe4750050, 0xe9362689, 0xedf73b3e, 0xf3b06b3b, 0xf771768c, 0xfa325055, 0xfef34de2,
    0xc6bcf05f, 0xc27dede8, 0xcf3ecb31, 0xcbffd686, 0xd5b88683, 0xd1799b34, 0xdc3abded, 0xd8fba05a,
    0x690ce0ee, 0x6dcdfd59, 0x608edb80, 0x644fc637, 0x7a089632, 0x7ec98b85, 0x738aad5c, 0x774bb0eb,
    0x4f040d56, 0x4bc510e1, 0x46863638, 0x42472b8f, 0x5c007b8a, 0x58c1663d, 0x558240e4, 0x51435d53,
    0x251d3b9e, 0x21dc2629, 0x2c9f00f0, 0x285e1d47, 0x36194d42, 0x32d850f5, 0x3f9b762c, 0x3b5a6b9b,
    0x0315d626, 0x07d4cb91, 0x0a97ed48, 0x0e56f0ff, 0x1011a0fa, 0x14d0bd4d, 0x19939b94, 0x1d528623,
    0xf12f560e, 0xf5ee4bb9, 0xf8ad6d60, 0xfc6c70d7, 0xe22b20d2, 0xe6ea3d65, 0xeba91bbc, 0xef68060b,
    0xd727bbb6, 0xd3e6a601, 0xdea580d8, 0xda649d6f, 0xc423cd6a, 0xc0e2d0dd, 0xcda1f604, 0xc960ebb3,
    0xbd3e8d7e, 0xb9ff90c9, 0xb4bcb610, 0xb07daba7, 0xae3afba2, 0xaafbe615, 0xa7b8c0cc, 0xa379dd7b,
    0x9b3660c6, 0x9ff77d71, 0x92b45ba8, 0x9675461f, 0x8832161a, 0x8cf30bad, 0x81b02d74, 0x857130c3,
    0x5d8a9099, 0x594b8d2e, 0x5408abf7, 0x50c9b640, 0x4e8ee645, 0x4a4ffbf2, 0x470cdd2b, 0x43cdc09c,
    0x7b827d21, 0x7f436096, 0x7200464f, 0x76c15bf8, 0x68860bfd, 0x6c47164a, 0x61043093, 0x65c52d24,
    0x119b4be9, 0x155a565e, 0x18197087, 0x1cd86d30, 0x029f3d35, 0x065e2082, 0x0b1d065b, 0x0fdc1bec,
    0x3793a651, 0x3352bbe6, 0x3e119d3f, 0x3ad08088, 0x2497d08d, 0x2056cd3a, 0x2d15ebe3, 0x29d4f654,
    0xc5a92679, 0xc1683bce, 0xcc2b1d17, 0xc8ea00a0, 0xd6ad50a5, 0xd26c4d12, 0xdf2f6bcb, 0xdbee767c,
    0xe3a1cbc1, 0xe760d676, 0xea23f0af, 0xeee2ed18, 0xf0a5bd1d, 0xf464a0aa, 0xf9278673, 0xfde69bc4,
    0x89b8fd09, 0x8d79e0be, 0x803ac667, 0x84fbdbd0, 0x9abc8bd5, 0x9e7d9662, 0x933eb0bb, 0x97ffad0c,
    0xafb010b1, 0xab710d06, 0xa6322bdf, 0xa2f33668, 0xbcb4666d, 0xb8757bda, 0xb5365d03, 0xb1f740b4
  ]);

  var CRC32 = function() {
    /**
     * The current CRC
     */
    var crc = 0xffffffff;

    /**
     * @return The current CRC
     */
    this.getCRC = function() {
      return (~crc) >>> 0; // return an unsigned value
    };

    /**
     * Update the CRC with a single byte
     * @param value The value to update the CRC with
     */
    this.updateCRC = function(value) {
      crc = (crc << 8) ^ crc32Lookup[((crc >>> 24) ^ value) & 0xff];
    };

    /**
     * Update the CRC with a sequence of identical bytes
     * @param value The value to update the CRC with
     * @param count The number of bytes
     */
    this.updateCRCRun = function(value, count) {
      while (count-- > 0) {
        crc = (crc << 8) ^ crc32Lookup[((crc >>> 24) ^ value) & 0xff];
      }
    };
  };
  return CRC32;
})();

var name$1 = "seek-bzip";
var version$1 = "1.0.6";
var contributors = [
	"C. Scott Ananian (http://cscott.net)",
	"Eli Skeggs",
	"Kevin Kwok",
	"Rob Landley (http://landley.net)"
];
var description$1 = "a pure-JavaScript Node.JS module for random-access decoding bzip2 data";
var main = "./lib/index.js";
var repository$1 = {
	type: "git",
	url: "https://github.com/cscott/seek-bzip.git"
};
var license$1 = "MIT";
var bin = {
	"seek-bunzip": "./bin/seek-bunzip",
	"seek-table": "./bin/seek-bzip-table"
};
var directories = {
	test: "test"
};
var dependencies$1 = {
	commander: "^2.8.1"
};
var devDependencies$1 = {
	fibers: "~1.0.6",
	mocha: "~2.2.5"
};
var scripts$1 = {
	test: "mocha"
};
var require$$3 = {
	name: name$1,
	version: version$1,
	contributors: contributors,
	description: description$1,
	main: main,
	repository: repository$1,
	license: license$1,
	bin: bin,
	directories: directories,
	dependencies: dependencies$1,
	devDependencies: devDependencies$1,
	scripts: scripts$1
};

/*
seek-bzip - a pure-javascript module for seeking within bzip2 data

Copyright (C) 2013 C. Scott Ananian
Copyright (C) 2012 Eli Skeggs
Copyright (C) 2011 Kevin Kwok

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Adapted from node-bzip, copyright 2012 Eli Skeggs.
Adapted from bzip2.js, copyright 2011 Kevin Kwok (antimatter15@gmail.com).

Based on micro-bunzip by Rob Landley (rob@landley.net).

Based on bzip2 decompression code by Julian R Seward (jseward@acm.org),
which also acknowledges contributions by Mike Burrows, David Wheeler,
Peter Fenwick, Alistair Moffat, Radford Neal, Ian H. Witten,
Robert Sedgewick, and Jon L. Bentley.
*/

var BitReader = bitreader;
var Stream$1 = stream$2;
var CRC32 = crc32$2;
var pjson = require$$3;

var MAX_HUFCODE_BITS = 20;
var MAX_SYMBOLS = 258;
var SYMBOL_RUNA = 0;
var SYMBOL_RUNB = 1;
var MIN_GROUPS = 2;
var MAX_GROUPS = 6;
var GROUP_SIZE = 50;

var WHOLEPI = "314159265359";
var SQRTPI = "177245385090";

var mtf = function(array, index) {
  var src = array[index], i;
  for (i = index; i > 0; i--) {
    array[i] = array[i-1];
  }
  array[0] = src;
  return src;
};

var Err = {
  OK: 0,
  LAST_BLOCK: -1,
  NOT_BZIP_DATA: -2,
  UNEXPECTED_INPUT_EOF: -3,
  UNEXPECTED_OUTPUT_EOF: -4,
  DATA_ERROR: -5,
  OUT_OF_MEMORY: -6,
  OBSOLETE_INPUT: -7,
  END_OF_BLOCK: -8
};
var ErrorMessages = {};
ErrorMessages[Err.LAST_BLOCK] =            "Bad file checksum";
ErrorMessages[Err.NOT_BZIP_DATA] =         "Not bzip data";
ErrorMessages[Err.UNEXPECTED_INPUT_EOF] =  "Unexpected input EOF";
ErrorMessages[Err.UNEXPECTED_OUTPUT_EOF] = "Unexpected output EOF";
ErrorMessages[Err.DATA_ERROR] =            "Data error";
ErrorMessages[Err.OUT_OF_MEMORY] =         "Out of memory";
ErrorMessages[Err.OBSOLETE_INPUT] = "Obsolete (pre 0.9.5) bzip format not supported.";

var _throw = function(status, optDetail) {
  var msg = ErrorMessages[status] || 'unknown error';
  if (optDetail) { msg += ': '+optDetail; }
  var e = new TypeError(msg);
  e.errorCode = status;
  throw e;
};

var Bunzip = function(inputStream, outputStream) {
  this.writePos = this.writeCurrent = this.writeCount = 0;

  this._start_bunzip(inputStream, outputStream);
};
Bunzip.prototype._init_block = function() {
  var moreBlocks = this._get_next_block();
  if ( !moreBlocks ) {
    this.writeCount = -1;
    return false; /* no more blocks */
  }
  this.blockCRC = new CRC32();
  return true;
};
/* XXX micro-bunzip uses (inputStream, inputBuffer, len) as arguments */
Bunzip.prototype._start_bunzip = function(inputStream, outputStream) {
  /* Ensure that file starts with "BZh['1'-'9']." */
  var buf = new Buffer(4);
  if (inputStream.read(buf, 0, 4) !== 4 ||
      String.fromCharCode(buf[0], buf[1], buf[2]) !== 'BZh')
    _throw(Err.NOT_BZIP_DATA, 'bad magic');

  var level = buf[3] - 0x30;
  if (level < 1 || level > 9)
    _throw(Err.NOT_BZIP_DATA, 'level out of range');

  this.reader = new BitReader(inputStream);

  /* Fourth byte (ascii '1'-'9'), indicates block size in units of 100k of
     uncompressed data.  Allocate intermediate buffer for block. */
  this.dbufSize = 100000 * level;
  this.nextoutput = 0;
  this.outputStream = outputStream;
  this.streamCRC = 0;
};
Bunzip.prototype._get_next_block = function() {
  var i, j, k;
  var reader = this.reader;
  // this is get_next_block() function from micro-bunzip:
  /* Read in header signature and CRC, then validate signature.
     (last block signature means CRC is for whole file, return now) */
  var h = reader.pi();
  if (h === SQRTPI) { // last block
    return false; /* no more blocks */
  }
  if (h !== WHOLEPI)
    _throw(Err.NOT_BZIP_DATA);
  this.targetBlockCRC = reader.read(32) >>> 0; // (convert to unsigned)
  this.streamCRC = (this.targetBlockCRC ^
                    ((this.streamCRC << 1) | (this.streamCRC>>>31))) >>> 0;
  /* We can add support for blockRandomised if anybody complains.  There was
     some code for this in busybox 1.0.0-pre3, but nobody ever noticed that
     it didn't actually work. */
  if (reader.read(1))
    _throw(Err.OBSOLETE_INPUT);
  var origPointer = reader.read(24);
  if (origPointer > this.dbufSize)
    _throw(Err.DATA_ERROR, 'initial position out of bounds');
  /* mapping table: if some byte values are never used (encoding things
     like ascii text), the compression code removes the gaps to have fewer
     symbols to deal with, and writes a sparse bitfield indicating which
     values were present.  We make a translation table to convert the symbols
     back to the corresponding bytes. */
  var t = reader.read(16);
  var symToByte = new Buffer(256), symTotal = 0;
  for (i = 0; i < 16; i++) {
    if (t & (1 << (0xF - i))) {
      var o = i * 16;
      k = reader.read(16);
      for (j = 0; j < 16; j++)
        if (k & (1 << (0xF - j)))
          symToByte[symTotal++] = o + j;
    }
  }

  /* How many different huffman coding groups does this block use? */
  var groupCount = reader.read(3);
  if (groupCount < MIN_GROUPS || groupCount > MAX_GROUPS)
    _throw(Err.DATA_ERROR);
  /* nSelectors: Every GROUP_SIZE many symbols we select a new huffman coding
     group.  Read in the group selector list, which is stored as MTF encoded
     bit runs.  (MTF=Move To Front, as each value is used it's moved to the
     start of the list.) */
  var nSelectors = reader.read(15);
  if (nSelectors === 0)
    _throw(Err.DATA_ERROR);

  var mtfSymbol = new Buffer(256);
  for (i = 0; i < groupCount; i++)
    mtfSymbol[i] = i;

  var selectors = new Buffer(nSelectors); // was 32768...

  for (i = 0; i < nSelectors; i++) {
    /* Get next value */
    for (j = 0; reader.read(1); j++)
      if (j >= groupCount) _throw(Err.DATA_ERROR);
    /* Decode MTF to get the next selector */
    selectors[i] = mtf(mtfSymbol, j);
  }

  /* Read the huffman coding tables for each group, which code for symTotal
     literal symbols, plus two run symbols (RUNA, RUNB) */
  var symCount = symTotal + 2;
  var groups = [], hufGroup;
  for (j = 0; j < groupCount; j++) {
    var length = new Buffer(symCount), temp = new Uint16Array(MAX_HUFCODE_BITS + 1);
    /* Read huffman code lengths for each symbol.  They're stored in
       a way similar to mtf; record a starting value for the first symbol,
       and an offset from the previous value for everys symbol after that. */
    t = reader.read(5); // lengths
    for (i = 0; i < symCount; i++) {
      for (;;) {
        if (t < 1 || t > MAX_HUFCODE_BITS) _throw(Err.DATA_ERROR);
        /* If first bit is 0, stop.  Else second bit indicates whether
           to increment or decrement the value. */
        if(!reader.read(1))
          break;
        if(!reader.read(1))
          t++;
        else
          t--;
      }
      length[i] = t;
    }

    /* Find largest and smallest lengths in this group */
    var minLen,  maxLen;
    minLen = maxLen = length[0];
    for (i = 1; i < symCount; i++) {
      if (length[i] > maxLen)
        maxLen = length[i];
      else if (length[i] < minLen)
        minLen = length[i];
    }

    /* Calculate permute[], base[], and limit[] tables from length[].
     *
     * permute[] is the lookup table for converting huffman coded symbols
     * into decoded symbols.  base[] is the amount to subtract from the
     * value of a huffman symbol of a given length when using permute[].
     *
     * limit[] indicates the largest numerical value a symbol with a given
     * number of bits can have.  This is how the huffman codes can vary in
     * length: each code with a value>limit[length] needs another bit.
     */
    hufGroup = {};
    groups.push(hufGroup);
    hufGroup.permute = new Uint16Array(MAX_SYMBOLS);
    hufGroup.limit = new Uint32Array(MAX_HUFCODE_BITS + 2);
    hufGroup.base = new Uint32Array(MAX_HUFCODE_BITS + 1);
    hufGroup.minLen = minLen;
    hufGroup.maxLen = maxLen;
    /* Calculate permute[].  Concurently, initialize temp[] and limit[]. */
    var pp = 0;
    for (i = minLen; i <= maxLen; i++) {
      temp[i] = hufGroup.limit[i] = 0;
      for (t = 0; t < symCount; t++)
        if (length[t] === i)
          hufGroup.permute[pp++] = t;
    }
    /* Count symbols coded for at each bit length */
    for (i = 0; i < symCount; i++)
      temp[length[i]]++;
    /* Calculate limit[] (the largest symbol-coding value at each bit
     * length, which is (previous limit<<1)+symbols at this level), and
     * base[] (number of symbols to ignore at each bit length, which is
     * limit minus the cumulative count of symbols coded for already). */
    pp = t = 0;
    for (i = minLen; i < maxLen; i++) {
      pp += temp[i];
      /* We read the largest possible symbol size and then unget bits
         after determining how many we need, and those extra bits could
         be set to anything.  (They're noise from future symbols.)  At
         each level we're really only interested in the first few bits,
         so here we set all the trailing to-be-ignored bits to 1 so they
         don't affect the value>limit[length] comparison. */
      hufGroup.limit[i] = pp - 1;
      pp <<= 1;
      t += temp[i];
      hufGroup.base[i + 1] = pp - t;
    }
    hufGroup.limit[maxLen + 1] = Number.MAX_VALUE; /* Sentinal value for reading next sym. */
    hufGroup.limit[maxLen] = pp + temp[maxLen] - 1;
    hufGroup.base[minLen] = 0;
  }
  /* We've finished reading and digesting the block header.  Now read this
     block's huffman coded symbols from the file and undo the huffman coding
     and run length encoding, saving the result into dbuf[dbufCount++]=uc */

  /* Initialize symbol occurrence counters and symbol Move To Front table */
  var byteCount = new Uint32Array(256);
  for (i = 0; i < 256; i++)
    mtfSymbol[i] = i;
  /* Loop through compressed symbols. */
  var runPos = 0, dbufCount = 0, selector = 0, uc;
  var dbuf = this.dbuf = new Uint32Array(this.dbufSize);
  symCount = 0;
  for (;;) {
    /* Determine which huffman coding group to use. */
    if (!(symCount--)) {
      symCount = GROUP_SIZE - 1;
      if (selector >= nSelectors) { _throw(Err.DATA_ERROR); }
      hufGroup = groups[selectors[selector++]];
    }
    /* Read next huffman-coded symbol. */
    i = hufGroup.minLen;
    j = reader.read(i);
    for (;;i++) {
      if (i > hufGroup.maxLen) { _throw(Err.DATA_ERROR); }
      if (j <= hufGroup.limit[i])
        break;
      j = (j << 1) | reader.read(1);
    }
    /* Huffman decode value to get nextSym (with bounds checking) */
    j -= hufGroup.base[i];
    if (j < 0 || j >= MAX_SYMBOLS) { _throw(Err.DATA_ERROR); }
    var nextSym = hufGroup.permute[j];
    /* We have now decoded the symbol, which indicates either a new literal
       byte, or a repeated run of the most recent literal byte.  First,
       check if nextSym indicates a repeated run, and if so loop collecting
       how many times to repeat the last literal. */
    if (nextSym === SYMBOL_RUNA || nextSym === SYMBOL_RUNB) {
      /* If this is the start of a new run, zero out counter */
      if (!runPos){
        runPos = 1;
        t = 0;
      }
      /* Neat trick that saves 1 symbol: instead of or-ing 0 or 1 at
         each bit position, add 1 or 2 instead.  For example,
         1011 is 1<<0 + 1<<1 + 2<<2.  1010 is 2<<0 + 2<<1 + 1<<2.
         You can make any bit pattern that way using 1 less symbol than
         the basic or 0/1 method (except all bits 0, which would use no
         symbols, but a run of length 0 doesn't mean anything in this
         context).  Thus space is saved. */
      if (nextSym === SYMBOL_RUNA)
        t += runPos;
      else
        t += 2 * runPos;
      runPos <<= 1;
      continue;
    }
    /* When we hit the first non-run symbol after a run, we now know
       how many times to repeat the last literal, so append that many
       copies to our buffer of decoded symbols (dbuf) now.  (The last
       literal used is the one at the head of the mtfSymbol array.) */
    if (runPos){
      runPos = 0;
      if (dbufCount + t > this.dbufSize) { _throw(Err.DATA_ERROR); }
      uc = symToByte[mtfSymbol[0]];
      byteCount[uc] += t;
      while (t--)
        dbuf[dbufCount++] = uc;
    }
    /* Is this the terminating symbol? */
    if (nextSym > symTotal)
      break;
    /* At this point, nextSym indicates a new literal character.  Subtract
       one to get the position in the MTF array at which this literal is
       currently to be found.  (Note that the result can't be -1 or 0,
       because 0 and 1 are RUNA and RUNB.  But another instance of the
       first symbol in the mtf array, position 0, would have been handled
       as part of a run above.  Therefore 1 unused mtf position minus
       2 non-literal nextSym values equals -1.) */
    if (dbufCount >= this.dbufSize) { _throw(Err.DATA_ERROR); }
    i = nextSym - 1;
    uc = mtf(mtfSymbol, i);
    uc = symToByte[uc];
    /* We have our literal byte.  Save it into dbuf. */
    byteCount[uc]++;
    dbuf[dbufCount++] = uc;
  }
  /* At this point, we've read all the huffman-coded symbols (and repeated
     runs) for this block from the input stream, and decoded them into the
     intermediate buffer.  There are dbufCount many decoded bytes in dbuf[].
     Now undo the Burrows-Wheeler transform on dbuf.
     See http://dogma.net/markn/articles/bwt/bwt.htm
  */
  if (origPointer < 0 || origPointer >= dbufCount) { _throw(Err.DATA_ERROR); }
  /* Turn byteCount into cumulative occurrence counts of 0 to n-1. */
  j = 0;
  for (i = 0; i < 256; i++) {
    k = j + byteCount[i];
    byteCount[i] = j;
    j = k;
  }
  /* Figure out what order dbuf would be in if we sorted it. */
  for (i = 0; i < dbufCount; i++) {
    uc = dbuf[i] & 0xff;
    dbuf[byteCount[uc]] |= (i << 8);
    byteCount[uc]++;
  }
  /* Decode first byte by hand to initialize "previous" byte.  Note that it
     doesn't get output, and if the first three characters are identical
     it doesn't qualify as a run (hence writeRunCountdown=5). */
  var pos = 0, current = 0, run = 0;
  if (dbufCount) {
    pos = dbuf[origPointer];
    current = (pos & 0xff);
    pos >>= 8;
    run = -1;
  }
  this.writePos = pos;
  this.writeCurrent = current;
  this.writeCount = dbufCount;
  this.writeRun = run;

  return true; /* more blocks to come */
};
/* Undo burrows-wheeler transform on intermediate buffer to produce output.
   If start_bunzip was initialized with out_fd=-1, then up to len bytes of
   data are written to outbuf.  Return value is number of bytes written or
   error (all errors are negative numbers).  If out_fd!=-1, outbuf and len
   are ignored, data is written to out_fd and return is RETVAL_OK or error.
*/
Bunzip.prototype._read_bunzip = function(outputBuffer, len) {
    var copies, previous, outbyte;
    /* james@jamestaylor.org: writeCount goes to -1 when the buffer is fully
       decoded, which results in this returning RETVAL_LAST_BLOCK, also
       equal to -1... Confusing, I'm returning 0 here to indicate no
       bytes written into the buffer */
  if (this.writeCount < 0) { return 0; }
  var dbuf = this.dbuf, pos = this.writePos, current = this.writeCurrent;
  var dbufCount = this.writeCount; this.outputsize;
  var run = this.writeRun;

  while (dbufCount) {
    dbufCount--;
    previous = current;
    pos = dbuf[pos];
    current = pos & 0xff;
    pos >>= 8;
    if (run++ === 3){
      copies = current;
      outbyte = previous;
      current = -1;
    } else {
      copies = 1;
      outbyte = current;
    }
    this.blockCRC.updateCRCRun(outbyte, copies);
    while (copies--) {
      this.outputStream.writeByte(outbyte);
      this.nextoutput++;
    }
    if (current != previous)
      run = 0;
  }
  this.writeCount = dbufCount;
  // check CRC
  if (this.blockCRC.getCRC() !== this.targetBlockCRC) {
    _throw(Err.DATA_ERROR, "Bad block CRC "+
           "(got "+this.blockCRC.getCRC().toString(16)+
           " expected "+this.targetBlockCRC.toString(16)+")");
  }
  return this.nextoutput;
};

var coerceInputStream = function(input) {
  if ('readByte' in input) { return input; }
  var inputStream = new Stream$1();
  inputStream.pos = 0;
  inputStream.readByte = function() { return input[this.pos++]; };
  inputStream.seek = function(pos) { this.pos = pos; };
  inputStream.eof = function() { return this.pos >= input.length; };
  return inputStream;
};
var coerceOutputStream = function(output) {
  var outputStream = new Stream$1();
  var resizeOk = true;
  if (output) {
    if (typeof(output)==='number') {
      outputStream.buffer = new Buffer(output);
      resizeOk = false;
    } else if ('writeByte' in output) {
      return output;
    } else {
      outputStream.buffer = output;
      resizeOk = false;
    }
  } else {
    outputStream.buffer = new Buffer(16384);
  }
  outputStream.pos = 0;
  outputStream.writeByte = function(_byte) {
    if (resizeOk && this.pos >= this.buffer.length) {
      var newBuffer = new Buffer(this.buffer.length*2);
      this.buffer.copy(newBuffer);
      this.buffer = newBuffer;
    }
    this.buffer[this.pos++] = _byte;
  };
  outputStream.getBuffer = function() {
    // trim buffer
    if (this.pos !== this.buffer.length) {
      if (!resizeOk)
        throw new TypeError('outputsize does not match decoded input');
      var newBuffer = new Buffer(this.pos);
      this.buffer.copy(newBuffer, 0, 0, this.pos);
      this.buffer = newBuffer;
    }
    return this.buffer;
  };
  outputStream._coerced = true;
  return outputStream;
};

/* Static helper functions */
Bunzip.Err = Err;
// 'input' can be a stream or a buffer
// 'output' can be a stream or a buffer or a number (buffer size)
Bunzip.decode = function(input, output, multistream) {
  // make a stream from a buffer, if necessary
  var inputStream = coerceInputStream(input);
  var outputStream = coerceOutputStream(output);

  var bz = new Bunzip(inputStream, outputStream);
  while (true) {
    if ('eof' in inputStream && inputStream.eof()) break;
    if (bz._init_block()) {
      bz._read_bunzip();
    } else {
      var targetStreamCRC = bz.reader.read(32) >>> 0; // (convert to unsigned)
      if (targetStreamCRC !== bz.streamCRC) {
        _throw(Err.DATA_ERROR, "Bad stream CRC "+
               "(got "+bz.streamCRC.toString(16)+
               " expected "+targetStreamCRC.toString(16)+")");
      }
      if (multistream &&
          'eof' in inputStream &&
          !inputStream.eof()) {
        // note that start_bunzip will also resync the bit reader to next byte
        bz._start_bunzip(inputStream, outputStream);
      } else break;
    }
  }
  if ('getBuffer' in outputStream)
    return outputStream.getBuffer();
};
Bunzip.decodeBlock = function(input, pos, output) {
  // make a stream from a buffer, if necessary
  var inputStream = coerceInputStream(input);
  var outputStream = coerceOutputStream(output);
  var bz = new Bunzip(inputStream, outputStream);
  bz.reader.seek(pos);
  /* Fill the decode buffer for the block */
  var moreBlocks = bz._get_next_block();
  if (moreBlocks) {
    /* Init the CRC for writing */
    bz.blockCRC = new CRC32();

    /* Zero this so the current byte from before the seek is not written */
    bz.writeCopies = 0;

    /* Decompress the block and write to stdout */
    bz._read_bunzip();
    // XXX keep writing?
  }
  if ('getBuffer' in outputStream)
    return outputStream.getBuffer();
};
/* Reads bzip2 file from stream or buffer `input`, and invoke
 * `callback(position, size)` once for each bzip2 block,
 * where position gives the starting position (in *bits*)
 * and size gives uncompressed size of the block (in *bytes*). */
Bunzip.table = function(input, callback, multistream) {
  // make a stream from a buffer, if necessary
  var inputStream = new Stream$1();
  inputStream.delegate = coerceInputStream(input);
  inputStream.pos = 0;
  inputStream.readByte = function() {
    this.pos++;
    return this.delegate.readByte();
  };
  if (inputStream.delegate.eof) {
    inputStream.eof = inputStream.delegate.eof.bind(inputStream.delegate);
  }
  var outputStream = new Stream$1();
  outputStream.pos = 0;
  outputStream.writeByte = function() { this.pos++; };

  var bz = new Bunzip(inputStream, outputStream);
  var blockSize = bz.dbufSize;
  while (true) {
    if ('eof' in inputStream && inputStream.eof()) break;

    var position = inputStream.pos*8 + bz.reader.bitOffset;
    if (bz.reader.hasByte) { position -= 8; }

    if (bz._init_block()) {
      var start = outputStream.pos;
      bz._read_bunzip();
      callback(position, outputStream.pos - start);
    } else {
      bz.reader.read(32); // (but we ignore the crc)
      if (multistream &&
          'eof' in inputStream &&
          !inputStream.eof()) {
        // note that start_bunzip will also resync the bit reader to next byte
        bz._start_bunzip(inputStream, outputStream);
        console.assert(bz.dbufSize === blockSize,
                       "shouldn't change block size within multistream file");
      } else break;
    }
  }
};

Bunzip.Stream = Stream$1;

Bunzip.version = pjson.version;
Bunzip.license = pjson.license;

var lib$1 = Bunzip;

var through$1 = {exports: {}};

(function (module, exports) {
	var Stream = require$$0$5;

	// through
	//
	// a stream that does nothing but re-emit the input.
	// useful for aggregating a series of changing but not ending streams into one stream)

	module.exports = through;
	through.through = through;

	//create a readable writable stream.

	function through (write, end, opts) {
	  write = write || function (data) { this.queue(data); };
	  end = end || function () { this.queue(null); };

	  var ended = false, destroyed = false, buffer = [], _ended = false;
	  var stream = new Stream();
	  stream.readable = stream.writable = true;
	  stream.paused = false;

	//  stream.autoPause   = !(opts && opts.autoPause   === false)
	  stream.autoDestroy = !(opts && opts.autoDestroy === false);

	  stream.write = function (data) {
	    write.call(this, data);
	    return !stream.paused
	  };

	  function drain() {
	    while(buffer.length && !stream.paused) {
	      var data = buffer.shift();
	      if(null === data)
	        return stream.emit('end')
	      else
	        stream.emit('data', data);
	    }
	  }

	  stream.queue = stream.push = function (data) {
	//    console.error(ended)
	    if(_ended) return stream
	    if(data === null) _ended = true;
	    buffer.push(data);
	    drain();
	    return stream
	  };

	  //this will be registered as the first 'end' listener
	  //must call destroy next tick, to make sure we're after any
	  //stream piped from here.
	  //this is only a problem if end is not emitted synchronously.
	  //a nicer way to do this is to make sure this is the last listener for 'end'

	  stream.on('end', function () {
	    stream.readable = false;
	    if(!stream.writable && stream.autoDestroy)
	      process.nextTick(function () {
	        stream.destroy();
	      });
	  });

	  function _end () {
	    stream.writable = false;
	    end.call(stream);
	    if(!stream.readable && stream.autoDestroy)
	      stream.destroy();
	  }

	  stream.end = function (data) {
	    if(ended) return
	    ended = true;
	    if(arguments.length) stream.write(data);
	    _end(); // will emit or queue
	    return stream
	  };

	  stream.destroy = function () {
	    if(destroyed) return
	    destroyed = true;
	    ended = true;
	    buffer.length = 0;
	    stream.writable = stream.readable = false;
	    stream.emit('close');
	    return stream
	  };

	  stream.pause = function () {
	    if(stream.paused) return
	    stream.paused = true;
	    return stream
	  };

	  stream.resume = function () {
	    if(stream.paused) {
	      stream.paused = false;
	      stream.emit('resume');
	    }
	    drain();
	    //may have become paused again,
	    //as drain emits 'data'.
	    if(!stream.paused)
	      stream.emit('drain');
	    return stream
	  };
	  return stream
	} 
} (through$1));

var throughExports = through$1.exports;

/* 
  bzip2.js - a small bzip2 decompression implementation
  
  Copyright 2011 by antimatter15 (antimatter15@gmail.com)
  
  Based on micro-bunzip by Rob Landley (rob@landley.net).

  Copyright (c) 2011 by antimatter15 (antimatter15@gmail.com).

  Permission is hereby granted, free of charge, to any person obtaining a
  copy of this software and associated documentation files (the "Software"),
  to deal in the Software without restriction, including without limitation
  the rights to use, copy, modify, merge, publish, distribute, sublicense,
  and/or sell copies of the Software, and to permit persons to whom the
  Software is furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included
  in all copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH
  THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

function Bzip2Error(message) {
    this.name = 'Bzip2Error';
    this.message = message;
    this.stack = (new Error()).stack;
}
Bzip2Error.prototype = new Error;
 
var message = {
    Error: function(message) {throw new Bzip2Error(message);}
};

var bzip2 = {};
bzip2.Bzip2Error = Bzip2Error;

bzip2.crcTable =
[
   0x00000000, 0x04c11db7, 0x09823b6e, 0x0d4326d9,
   0x130476dc, 0x17c56b6b, 0x1a864db2, 0x1e475005,
   0x2608edb8, 0x22c9f00f, 0x2f8ad6d6, 0x2b4bcb61,
   0x350c9b64, 0x31cd86d3, 0x3c8ea00a, 0x384fbdbd,
   0x4c11db70, 0x48d0c6c7, 0x4593e01e, 0x4152fda9,
   0x5f15adac, 0x5bd4b01b, 0x569796c2, 0x52568b75,
   0x6a1936c8, 0x6ed82b7f, 0x639b0da6, 0x675a1011,
   0x791d4014, 0x7ddc5da3, 0x709f7b7a, 0x745e66cd,
   0x9823b6e0, 0x9ce2ab57, 0x91a18d8e, 0x95609039,
   0x8b27c03c, 0x8fe6dd8b, 0x82a5fb52, 0x8664e6e5,
   0xbe2b5b58, 0xbaea46ef, 0xb7a96036, 0xb3687d81,
   0xad2f2d84, 0xa9ee3033, 0xa4ad16ea, 0xa06c0b5d,
   0xd4326d90, 0xd0f37027, 0xddb056fe, 0xd9714b49,
   0xc7361b4c, 0xc3f706fb, 0xceb42022, 0xca753d95,
   0xf23a8028, 0xf6fb9d9f, 0xfbb8bb46, 0xff79a6f1,
   0xe13ef6f4, 0xe5ffeb43, 0xe8bccd9a, 0xec7dd02d,
   0x34867077, 0x30476dc0, 0x3d044b19, 0x39c556ae,
   0x278206ab, 0x23431b1c, 0x2e003dc5, 0x2ac12072,
   0x128e9dcf, 0x164f8078, 0x1b0ca6a1, 0x1fcdbb16,
   0x018aeb13, 0x054bf6a4, 0x0808d07d, 0x0cc9cdca,
   0x7897ab07, 0x7c56b6b0, 0x71159069, 0x75d48dde,
   0x6b93dddb, 0x6f52c06c, 0x6211e6b5, 0x66d0fb02,
   0x5e9f46bf, 0x5a5e5b08, 0x571d7dd1, 0x53dc6066,
   0x4d9b3063, 0x495a2dd4, 0x44190b0d, 0x40d816ba,
   0xaca5c697, 0xa864db20, 0xa527fdf9, 0xa1e6e04e,
   0xbfa1b04b, 0xbb60adfc, 0xb6238b25, 0xb2e29692,
   0x8aad2b2f, 0x8e6c3698, 0x832f1041, 0x87ee0df6,
   0x99a95df3, 0x9d684044, 0x902b669d, 0x94ea7b2a,
   0xe0b41de7, 0xe4750050, 0xe9362689, 0xedf73b3e,
   0xf3b06b3b, 0xf771768c, 0xfa325055, 0xfef34de2,
   0xc6bcf05f, 0xc27dede8, 0xcf3ecb31, 0xcbffd686,
   0xd5b88683, 0xd1799b34, 0xdc3abded, 0xd8fba05a,
   0x690ce0ee, 0x6dcdfd59, 0x608edb80, 0x644fc637,
   0x7a089632, 0x7ec98b85, 0x738aad5c, 0x774bb0eb,
   0x4f040d56, 0x4bc510e1, 0x46863638, 0x42472b8f,
   0x5c007b8a, 0x58c1663d, 0x558240e4, 0x51435d53,
   0x251d3b9e, 0x21dc2629, 0x2c9f00f0, 0x285e1d47,
   0x36194d42, 0x32d850f5, 0x3f9b762c, 0x3b5a6b9b,
   0x0315d626, 0x07d4cb91, 0x0a97ed48, 0x0e56f0ff,
   0x1011a0fa, 0x14d0bd4d, 0x19939b94, 0x1d528623,
   0xf12f560e, 0xf5ee4bb9, 0xf8ad6d60, 0xfc6c70d7,
   0xe22b20d2, 0xe6ea3d65, 0xeba91bbc, 0xef68060b,
   0xd727bbb6, 0xd3e6a601, 0xdea580d8, 0xda649d6f,
   0xc423cd6a, 0xc0e2d0dd, 0xcda1f604, 0xc960ebb3,
   0xbd3e8d7e, 0xb9ff90c9, 0xb4bcb610, 0xb07daba7,
   0xae3afba2, 0xaafbe615, 0xa7b8c0cc, 0xa379dd7b,
   0x9b3660c6, 0x9ff77d71, 0x92b45ba8, 0x9675461f,
   0x8832161a, 0x8cf30bad, 0x81b02d74, 0x857130c3,
   0x5d8a9099, 0x594b8d2e, 0x5408abf7, 0x50c9b640,
   0x4e8ee645, 0x4a4ffbf2, 0x470cdd2b, 0x43cdc09c,
   0x7b827d21, 0x7f436096, 0x7200464f, 0x76c15bf8,
   0x68860bfd, 0x6c47164a, 0x61043093, 0x65c52d24,
   0x119b4be9, 0x155a565e, 0x18197087, 0x1cd86d30,
   0x029f3d35, 0x065e2082, 0x0b1d065b, 0x0fdc1bec,
   0x3793a651, 0x3352bbe6, 0x3e119d3f, 0x3ad08088,
   0x2497d08d, 0x2056cd3a, 0x2d15ebe3, 0x29d4f654,
   0xc5a92679, 0xc1683bce, 0xcc2b1d17, 0xc8ea00a0,
   0xd6ad50a5, 0xd26c4d12, 0xdf2f6bcb, 0xdbee767c,
   0xe3a1cbc1, 0xe760d676, 0xea23f0af, 0xeee2ed18,
   0xf0a5bd1d, 0xf464a0aa, 0xf9278673, 0xfde69bc4,
   0x89b8fd09, 0x8d79e0be, 0x803ac667, 0x84fbdbd0,
   0x9abc8bd5, 0x9e7d9662, 0x933eb0bb, 0x97ffad0c,
   0xafb010b1, 0xab710d06, 0xa6322bdf, 0xa2f33668,
   0xbcb4666d, 0xb8757bda, 0xb5365d03, 0xb1f740b4
];

bzip2.array = function(bytes) {
    var bit = 0, byte = 0;
    var BITMASK = [0, 0x01, 0x03, 0x07, 0x0F, 0x1F, 0x3F, 0x7F, 0xFF ];
    return function(n) {
        var result = 0;
        while(n > 0) {
            var left = 8 - bit;
            if (n >= left) {
                result <<= left;
                result |= (BITMASK[left] & bytes[byte++]);
                bit = 0;
                n -= left;
            } else {
                result <<= n;
                result |= ((bytes[byte] & (BITMASK[n] << (8 - n - bit))) >> (8 - n - bit));
                bit += n;
                n = 0;
            }
        }
        return result;
    }
};

    
bzip2.simple = function(srcbuffer, stream) {
    var bits = bzip2.array(srcbuffer);
    var size = bzip2.header(bits);
    var ret = false;
    var bufsize = 100000 * size;
    var buf = new Int32Array(bufsize);
    
    do {
        ret = bzip2.decompress(bits, stream, buf, bufsize);        
    } while(!ret);
};

bzip2.header = function(bits) {
    this.byteCount = new Int32Array(256);
    this.symToByte = new Uint8Array(256);
    this.mtfSymbol = new Int32Array(256);
    this.selectors = new Uint8Array(0x8000);

    if (bits(8*3) != 4348520) message.Error("No magic number found");

    var i = bits(8) - 48;
    if (i < 1 || i > 9) message.Error("Not a BZIP archive");
    return i;
};


//takes a function for reading the block data (starting with 0x314159265359)
//a block size (0-9) (optional, defaults to 9)
//a length at which to stop decompressing and return the output
bzip2.decompress = function(bits, stream, buf, bufsize, streamCRC) {
    var MAX_HUFCODE_BITS = 20;
    var MAX_SYMBOLS = 258;
    var SYMBOL_RUNA = 0;
    var SYMBOL_RUNB = 1;
    var GROUP_SIZE = 50;
    var crc = 0 ^ (-1);
    
    for(var h = '', i = 0; i < 6; i++) h += bits(8).toString(16);
    if (h == "177245385090") {
      var finalCRC = bits(32)|0;
      if (finalCRC !== streamCRC) message.Error("Error in bzip2: crc32 do not match");
      // align stream to byte
      bits(null);
      return null; // reset streamCRC for next call
    }
    if (h != "314159265359") message.Error("eek not valid bzip data");
    var crcblock = bits(32)|0; // CRC code
    if (bits(1)) message.Error("unsupported obsolete version");
    var origPtr = bits(24);
    if (origPtr > bufsize) message.Error("Initial position larger than buffer size");
    var t = bits(16);
    var symTotal = 0;
    for (i = 0; i < 16; i++) {
        if (t & (1 << (15 - i))) {
            var k = bits(16);
            for(j = 0; j < 16; j++) {
                if (k & (1 << (15 - j))) {
                    this.symToByte[symTotal++] = (16 * i) + j;
                }
            }
        }
    }

    var groupCount = bits(3);
    if (groupCount < 2 || groupCount > 6) message.Error("another error");
    var nSelectors = bits(15);
    if (nSelectors == 0) message.Error("meh");
    for(var i = 0; i < groupCount; i++) this.mtfSymbol[i] = i;

    for(var i = 0; i < nSelectors; i++) {
        for(var j = 0; bits(1); j++) if (j >= groupCount) message.Error("whoops another error");
        var uc = this.mtfSymbol[j];
        for(var k = j-1; k>=0; k--) {
            this.mtfSymbol[k+1] = this.mtfSymbol[k];
        }
        this.mtfSymbol[0] = uc;
        this.selectors[i] = uc;
    }

    var symCount = symTotal + 2;
    var groups = [];
    var length = new Uint8Array(MAX_SYMBOLS),
    temp = new Uint16Array(MAX_HUFCODE_BITS+1);

    var hufGroup;

    for(var j = 0; j < groupCount; j++) {
        t = bits(5); //lengths
        for(var i = 0; i < symCount; i++) {
            while(true){
                if (t < 1 || t > MAX_HUFCODE_BITS) message.Error("I gave up a while ago on writing error messages");
                if (!bits(1)) break;
                if (!bits(1)) t++;
                else t--;
            }
            length[i] = t;
        }
        var  minLen,  maxLen;
        minLen = maxLen = length[0];
        for(var i = 1; i < symCount; i++) {
            if (length[i] > maxLen) maxLen = length[i];
            else if (length[i] < minLen) minLen = length[i];
        }
        hufGroup = groups[j] = {};
        hufGroup.permute = new Int32Array(MAX_SYMBOLS);
        hufGroup.limit = new Int32Array(MAX_HUFCODE_BITS + 1);
        hufGroup.base = new Int32Array(MAX_HUFCODE_BITS + 1);

        hufGroup.minLen = minLen;
        hufGroup.maxLen = maxLen;
        var base = hufGroup.base;
        var limit = hufGroup.limit;
        var pp = 0;
        for(var i = minLen; i <= maxLen; i++)
        for(var t = 0; t < symCount; t++)
        if (length[t] == i) hufGroup.permute[pp++] = t;
        for(i = minLen; i <= maxLen; i++) temp[i] = limit[i] = 0;
        for(i = 0; i < symCount; i++) temp[length[i]]++;
        pp = t = 0;
        for(i = minLen; i < maxLen; i++) {
            pp += temp[i];
            limit[i] = pp - 1;
            pp <<= 1;
            base[i+1] = pp - (t += temp[i]);
        }
        limit[maxLen] = pp + temp[maxLen] - 1;
        base[minLen] = 0;
    }

    for(var i = 0; i < 256; i++) { 
        this.mtfSymbol[i] = i;
        this.byteCount[i] = 0;
    }
    var runPos, count, symCount, selector;
    runPos = count = symCount = selector = 0;    
    while(true) {
        if (!(symCount--)) {
            symCount = GROUP_SIZE - 1;
            if (selector >= nSelectors) message.Error("meow i'm a kitty, that's an error");
            hufGroup = groups[this.selectors[selector++]];
            base = hufGroup.base;
            limit = hufGroup.limit;
        }
        i = hufGroup.minLen;
        j = bits(i);
        while(true) {
            if (i > hufGroup.maxLen) message.Error("rawr i'm a dinosaur");
            if (j <= limit[i]) break;
            i++;
            j = (j << 1) | bits(1);
        }
        j -= base[i];
        if (j < 0 || j >= MAX_SYMBOLS) message.Error("moo i'm a cow");
        var nextSym = hufGroup.permute[j];
        if (nextSym == SYMBOL_RUNA || nextSym == SYMBOL_RUNB) {
            if (!runPos){
                runPos = 1;
                t = 0;
            }
            if (nextSym == SYMBOL_RUNA) t += runPos;
            else t += 2 * runPos;
            runPos <<= 1;
            continue;
        }
        if (runPos) {
            runPos = 0;
            if (count + t > bufsize) message.Error("Boom.");
            uc = this.symToByte[this.mtfSymbol[0]];
            this.byteCount[uc] += t;
            while(t--) buf[count++] = uc;
        }
        if (nextSym > symTotal) break;
        if (count >= bufsize) message.Error("I can't think of anything. Error");
        i = nextSym - 1;
        uc = this.mtfSymbol[i];
        for(var k = i-1; k>=0; k--) {
            this.mtfSymbol[k+1] = this.mtfSymbol[k];
        }
        this.mtfSymbol[0] = uc;
        uc = this.symToByte[uc];
        this.byteCount[uc]++;
        buf[count++] = uc;
    }
    if (origPtr < 0 || origPtr >= count) message.Error("I'm a monkey and I'm throwing something at someone, namely you");
    var j = 0;
    for(var i = 0; i < 256; i++) {
        k = j + this.byteCount[i];
        this.byteCount[i] = j;
        j = k;
    }
    for(var i = 0; i < count; i++) {
        uc = buf[i] & 0xff;
        buf[this.byteCount[uc]] |= (i << 8);
        this.byteCount[uc]++;
    }
    var pos = 0, current = 0, run = 0;
    if (count) {
        pos = buf[origPtr];
        current = (pos & 0xff);
        pos >>= 8;
        run = -1;
    }
    count = count;
    var copies, previous, outbyte;
    while(count) {
        count--;
        previous = current;
        pos = buf[pos];
        current = pos & 0xff;
        pos >>= 8;
        if (run++ == 3) {
            copies = current;
            outbyte = previous;
            current = -1;
        } else {
            copies = 1;
            outbyte = current;
        }
        while(copies--) {
            crc = ((crc << 8) ^ this.crcTable[((crc>>24) ^ outbyte) & 0xFF])&0xFFFFFFFF; // crc32
            stream(outbyte);
        }
        if (current != previous) run = 0;
    }

    crc = (crc ^ (-1)) >>> 0;
    if ((crc|0) != (crcblock|0)) message.Error("Error in bzip2: crc32 do not match");
    streamCRC = (crc ^ ((streamCRC << 1) | (streamCRC >>> 31))) & 0xFFFFFFFF;
    return streamCRC;
};

var bzip2_1 = bzip2;

var BITMASK = [0, 0x01, 0x03, 0x07, 0x0F, 0x1F, 0x3F, 0x7F, 0xFF];

// returns a function that reads bits.
// takes a buffer iterator as input
var bit_iterator = function bitIterator(nextBuffer) {
    var bit = 0, byte = 0;
    var bytes = nextBuffer();
    var f = function(n) {
        if (n === null && bit != 0) {  // align to byte boundary
            bit = 0;
            byte++;
            return;
        }
        var result = 0;
        while(n > 0) {
            if (byte >= bytes.length) {
                byte = 0;
                bytes = nextBuffer();
            }
            var left = 8 - bit;
            if (bit === 0 && n > 0)
                f.bytesRead++;
            if (n >= left) {
                result <<= left;
                result |= (BITMASK[left] & bytes[byte++]);
                bit = 0;
                n -= left;
            } else {
                result <<= n;
                result |= ((bytes[byte] & (BITMASK[n] << (8 - n - bit))) >> (8 - n - bit));
                bit += n;
                n = 0;
            }
        }
        return result;
    };
    f.bytesRead = 0;
    return f;
};

var through = throughExports;
var bz2 = bzip2_1;
var bitIterator = bit_iterator;

var unbzip2Stream_1 = unbzip2Stream$1;

function unbzip2Stream$1() {
    var bufferQueue = [];
    var hasBytes = 0;
    var blockSize = 0;
    var broken = false;
    var bitReader = null;
    var streamCRC = null;

    function decompressBlock(push){
        if(!blockSize){
            blockSize = bz2.header(bitReader);
            //console.error("got header of", blockSize);
            streamCRC = 0;
            return true;
        }else {
            var bufsize = 100000 * blockSize;
            var buf = new Int32Array(bufsize);
            
            var chunk = [];
            var f = function(b) {
                chunk.push(b);
            };

            streamCRC = bz2.decompress(bitReader, f, buf, bufsize, streamCRC);
            if (streamCRC === null) {
                // reset for next bzip2 header
                blockSize = 0;
                return false;
            }else {
                //console.error('decompressed', chunk.length,'bytes');
                push(Buffer.from(chunk));
                return true;
            }
        }
    }

    var outlength = 0;
    function decompressAndQueue(stream) {
        if (broken) return;
        try {
            return decompressBlock(function(d) {
                stream.queue(d);
                if (d !== null) {
                    //console.error('write at', outlength.toString(16));
                    outlength += d.length;
                } else {
                    //console.error('written EOS');
                }
            });
        } catch(e) {
            //console.error(e);
            stream.emit('error', e);
            broken = true;
            return false;
        }
    }

    return through(
        function write(data) {
            //console.error('received', data.length,'bytes in', typeof data);
            bufferQueue.push(data);
            hasBytes += data.length;
            if (bitReader === null) {
                bitReader = bitIterator(function() {
                    return bufferQueue.shift();
                });
            }
            while (!broken && hasBytes - bitReader.bytesRead + 1 >= ((25000 + 100000 * blockSize) || 4)){
                //console.error('decompressing with', hasBytes - bitReader.bytesRead + 1, 'bytes in buffer');
                decompressAndQueue(this);
            }
        },
        function end(x) {
            //console.error(x,'last compressing with', hasBytes, 'bytes in buffer');
            while (!broken && bitReader && hasBytes > bitReader.bytesRead){
                decompressAndQueue(this);
            }
            if (!broken) {
                if (streamCRC !== null)
                    this.emit('error', new Error("input stream ended prematurely"));
                this.queue(null);
            }
        }
    );
}

const decompressTar$2 = decompressTar$3;
const fileType$5 = fileType$6;
const isStream$1 = isStreamExports;
const seekBzip = lib$1;
const unbzip2Stream = unbzip2Stream_1;

var decompressTarbz2$1 = () => input => {
	if (!Buffer.isBuffer(input) && !isStream$1(input)) {
		return Promise.reject(new TypeError(`Expected a Buffer or Stream, got ${typeof input}`));
	}

	if (Buffer.isBuffer(input) && (!fileType$5(input) || fileType$5(input).ext !== 'bz2')) {
		return Promise.resolve([]);
	}

	if (Buffer.isBuffer(input)) {
		return decompressTar$2()(seekBzip.decode(input));
	}

	return decompressTar$2()(input.pipe(unbzip2Stream()));
};

const zlib$2 = require$$1$4;
const decompressTar$1 = decompressTar$3;
const fileType$4 = fileType$8;
const isStream = isStreamExports;

var decompressTargz$1 = () => input => {
	if (!Buffer.isBuffer(input) && !isStream(input)) {
		return Promise.reject(new TypeError(`Expected a Buffer or Stream, got ${typeof input}`));
	}

	if (Buffer.isBuffer(input) && (!fileType$4(input) || fileType$4(input).ext !== 'gz')) {
		return Promise.resolve([]);
	}

	const unzip = zlib$2.createGunzip();
	const result = decompressTar$1()(unzip);

	if (Buffer.isBuffer(input)) {
		unzip.end(input);
	} else {
		input.pipe(unzip);
	}

	return result;
};

var fileType$3 = function (buf) {
	if (!(buf && buf.length > 1)) {
		return null;
	}

	if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
		return {
			ext: 'jpg',
			mime: 'image/jpeg'
		};
	}

	if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
		return {
			ext: 'png',
			mime: 'image/png'
		};
	}

	if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) {
		return {
			ext: 'gif',
			mime: 'image/gif'
		};
	}

	if (buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) {
		return {
			ext: 'webp',
			mime: 'image/webp'
		};
	}

	if (buf[0] === 0x46 && buf[1] === 0x4C && buf[2] === 0x49 && buf[3] === 0x46) {
		return {
			ext: 'flif',
			mime: 'image/flif'
		};
	}

	// needs to be before `tif` check
	if (((buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2A && buf[3] === 0x0) || (buf[0] === 0x4D && buf[1] === 0x4D && buf[2] === 0x0 && buf[3] === 0x2A)) && buf[8] === 0x43 && buf[9] === 0x52) {
		return {
			ext: 'cr2',
			mime: 'image/x-canon-cr2'
		};
	}

	if ((buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0x2A && buf[3] === 0x0) || (buf[0] === 0x4D && buf[1] === 0x4D && buf[2] === 0x0 && buf[3] === 0x2A)) {
		return {
			ext: 'tif',
			mime: 'image/tiff'
		};
	}

	if (buf[0] === 0x42 && buf[1] === 0x4D) {
		return {
			ext: 'bmp',
			mime: 'image/bmp'
		};
	}

	if (buf[0] === 0x49 && buf[1] === 0x49 && buf[2] === 0xBC) {
		return {
			ext: 'jxr',
			mime: 'image/vnd.ms-photo'
		};
	}

	if (buf[0] === 0x38 && buf[1] === 0x42 && buf[2] === 0x50 && buf[3] === 0x53) {
		return {
			ext: 'psd',
			mime: 'image/vnd.adobe.photoshop'
		};
	}

	// needs to be before `zip` check
	if (buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x3 && buf[3] === 0x4 && buf[30] === 0x6D && buf[31] === 0x69 && buf[32] === 0x6D && buf[33] === 0x65 && buf[34] === 0x74 && buf[35] === 0x79 && buf[36] === 0x70 && buf[37] === 0x65 && buf[38] === 0x61 && buf[39] === 0x70 && buf[40] === 0x70 && buf[41] === 0x6C && buf[42] === 0x69 && buf[43] === 0x63 && buf[44] === 0x61 && buf[45] === 0x74 && buf[46] === 0x69 && buf[47] === 0x6F && buf[48] === 0x6E && buf[49] === 0x2F && buf[50] === 0x65 && buf[51] === 0x70 && buf[52] === 0x75 && buf[53] === 0x62 && buf[54] === 0x2B && buf[55] === 0x7A && buf[56] === 0x69 && buf[57] === 0x70) {
		return {
			ext: 'epub',
			mime: 'application/epub+zip'
		};
	}

	// needs to be before `zip` check
	// assumes signed .xpi from addons.mozilla.org
	if (buf[0] === 0x50 && buf[1] === 0x4B && buf[2] === 0x3 && buf[3] === 0x4 && buf[30] === 0x4D && buf[31] === 0x45 && buf[32] === 0x54 && buf[33] === 0x41 && buf[34] === 0x2D && buf[35] === 0x49 && buf[36] === 0x4E && buf[37] === 0x46 && buf[38] === 0x2F && buf[39] === 0x6D && buf[40] === 0x6F && buf[41] === 0x7A && buf[42] === 0x69 && buf[43] === 0x6C && buf[44] === 0x6C && buf[45] === 0x61 && buf[46] === 0x2E && buf[47] === 0x72 && buf[48] === 0x73 && buf[49] === 0x61) {
		return {
			ext: 'xpi',
			mime: 'application/x-xpinstall'
		};
	}

	if (buf[0] === 0x50 && buf[1] === 0x4B && (buf[2] === 0x3 || buf[2] === 0x5 || buf[2] === 0x7) && (buf[3] === 0x4 || buf[3] === 0x6 || buf[3] === 0x8)) {
		return {
			ext: 'zip',
			mime: 'application/zip'
		};
	}

	if (buf[257] === 0x75 && buf[258] === 0x73 && buf[259] === 0x74 && buf[260] === 0x61 && buf[261] === 0x72) {
		return {
			ext: 'tar',
			mime: 'application/x-tar'
		};
	}

	if (buf[0] === 0x52 && buf[1] === 0x61 && buf[2] === 0x72 && buf[3] === 0x21 && buf[4] === 0x1A && buf[5] === 0x7 && (buf[6] === 0x0 || buf[6] === 0x1)) {
		return {
			ext: 'rar',
			mime: 'application/x-rar-compressed'
		};
	}

	if (buf[0] === 0x1F && buf[1] === 0x8B && buf[2] === 0x8) {
		return {
			ext: 'gz',
			mime: 'application/gzip'
		};
	}

	if (buf[0] === 0x42 && buf[1] === 0x5A && buf[2] === 0x68) {
		return {
			ext: 'bz2',
			mime: 'application/x-bzip2'
		};
	}

	if (buf[0] === 0x37 && buf[1] === 0x7A && buf[2] === 0xBC && buf[3] === 0xAF && buf[4] === 0x27 && buf[5] === 0x1C) {
		return {
			ext: '7z',
			mime: 'application/x-7z-compressed'
		};
	}

	if (buf[0] === 0x78 && buf[1] === 0x01) {
		return {
			ext: 'dmg',
			mime: 'application/x-apple-diskimage'
		};
	}

	if (
		(buf[0] === 0x0 && buf[1] === 0x0 && buf[2] === 0x0 && (buf[3] === 0x18 || buf[3] === 0x20) && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) ||
		(buf[0] === 0x33 && buf[1] === 0x67 && buf[2] === 0x70 && buf[3] === 0x35) ||
		(buf[0] === 0x0 && buf[1] === 0x0 && buf[2] === 0x0 && buf[3] === 0x1C && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70 && buf[8] === 0x6D && buf[9] === 0x70 && buf[10] === 0x34 && buf[11] === 0x32 && buf[16] === 0x6D && buf[17] === 0x70 && buf[18] === 0x34 && buf[19] === 0x31 && buf[20] === 0x6D && buf[21] === 0x70 && buf[22] === 0x34 && buf[23] === 0x32 && buf[24] === 0x69 && buf[25] === 0x73 && buf[26] === 0x6F && buf[27] === 0x6D) ||
		(buf[0] === 0x0 && buf[1] === 0x0 && buf[2] === 0x0 && buf[3] === 0x1C && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70 && buf[8] === 0x69 && buf[9] === 0x73 && buf[10] === 0x6F && buf[11] === 0x6D) ||
		(buf[0] === 0x0 && buf[1] === 0x0 && buf[2] === 0x0 && buf[3] === 0x1c && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70 && buf[8] === 0x6D && buf[9] === 0x70 && buf[10] === 0x34 && buf[11] === 0x32 && buf[12] === 0x0 && buf[13] === 0x0 && buf[14] === 0x0 && buf[15] === 0x0)
	) {
		return {
			ext: 'mp4',
			mime: 'video/mp4'
		};
	}

	if ((buf[0] === 0x0 && buf[1] === 0x0 && buf[2] === 0x0 && buf[3] === 0x1C && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70 && buf[8] === 0x4D && buf[9] === 0x34 && buf[10] === 0x56)) {
		return {
			ext: 'm4v',
			mime: 'video/x-m4v'
		};
	}

	if (buf[0] === 0x4D && buf[1] === 0x54 && buf[2] === 0x68 && buf[3] === 0x64) {
		return {
			ext: 'mid',
			mime: 'audio/midi'
		};
	}

	// needs to be before the `webm` check
	if (buf[31] === 0x6D && buf[32] === 0x61 && buf[33] === 0x74 && buf[34] === 0x72 && buf[35] === 0x6f && buf[36] === 0x73 && buf[37] === 0x6B && buf[38] === 0x61) {
		return {
			ext: 'mkv',
			mime: 'video/x-matroska'
		};
	}

	if (buf[0] === 0x1A && buf[1] === 0x45 && buf[2] === 0xDF && buf[3] === 0xA3) {
		return {
			ext: 'webm',
			mime: 'video/webm'
		};
	}

	if (buf[0] === 0x0 && buf[1] === 0x0 && buf[2] === 0x0 && buf[3] === 0x14 && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) {
		return {
			ext: 'mov',
			mime: 'video/quicktime'
		};
	}

	if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x41 && buf[9] === 0x56 && buf[10] === 0x49) {
		return {
			ext: 'avi',
			mime: 'video/x-msvideo'
		};
	}

	if (buf[0] === 0x30 && buf[1] === 0x26 && buf[2] === 0xB2 && buf[3] === 0x75 && buf[4] === 0x8E && buf[5] === 0x66 && buf[6] === 0xCF && buf[7] === 0x11 && buf[8] === 0xA6 && buf[9] === 0xD9) {
		return {
			ext: 'wmv',
			mime: 'video/x-ms-wmv'
		};
	}

	if (buf[0] === 0x0 && buf[1] === 0x0 && buf[2] === 0x1 && buf[3].toString(16)[0] === 'b') {
		return {
			ext: 'mpg',
			mime: 'video/mpeg'
		};
	}

	if ((buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33) || (buf[0] === 0xFF && buf[1] === 0xfb)) {
		return {
			ext: 'mp3',
			mime: 'audio/mpeg'
		};
	}

	if ((buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70 && buf[8] === 0x4D && buf[9] === 0x34 && buf[10] === 0x41) || (buf[0] === 0x4D && buf[1] === 0x34 && buf[2] === 0x41 && buf[3] === 0x20)) {
		return {
			ext: 'm4a',
			mime: 'audio/m4a'
		};
	}

	// needs to be before `ogg` check
	if (buf[28] === 0x4F && buf[29] === 0x70 && buf[30] === 0x75 && buf[31] === 0x73 && buf[32] === 0x48 && buf[33] === 0x65 && buf[34] === 0x61 && buf[35] === 0x64) {
		return {
			ext: 'opus',
			mime: 'audio/opus'
		};
	}

	if (buf[0] === 0x4F && buf[1] === 0x67 && buf[2] === 0x67 && buf[3] === 0x53) {
		return {
			ext: 'ogg',
			mime: 'audio/ogg'
		};
	}

	if (buf[0] === 0x66 && buf[1] === 0x4C && buf[2] === 0x61 && buf[3] === 0x43) {
		return {
			ext: 'flac',
			mime: 'audio/x-flac'
		};
	}

	if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x57 && buf[9] === 0x41 && buf[10] === 0x56 && buf[11] === 0x45) {
		return {
			ext: 'wav',
			mime: 'audio/x-wav'
		};
	}

	if (buf[0] === 0x23 && buf[1] === 0x21 && buf[2] === 0x41 && buf[3] === 0x4D && buf[4] === 0x52 && buf[5] === 0x0A) {
		return {
			ext: 'amr',
			mime: 'audio/amr'
		};
	}

	if (buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
		return {
			ext: 'pdf',
			mime: 'application/pdf'
		};
	}

	if (buf[0] === 0x4D && buf[1] === 0x5A) {
		return {
			ext: 'exe',
			mime: 'application/x-msdownload'
		};
	}

	if ((buf[0] === 0x43 || buf[0] === 0x46) && buf[1] === 0x57 && buf[2] === 0x53) {
		return {
			ext: 'swf',
			mime: 'application/x-shockwave-flash'
		};
	}

	if (buf[0] === 0x7B && buf[1] === 0x5C && buf[2] === 0x72 && buf[3] === 0x74 && buf[4] === 0x66) {
		return {
			ext: 'rtf',
			mime: 'application/rtf'
		};
	}

	if (
		(buf[0] === 0x77 && buf[1] === 0x4F && buf[2] === 0x46 && buf[3] === 0x46) &&
		(
			(buf[4] === 0x00 && buf[5] === 0x01 && buf[6] === 0x00 && buf[7] === 0x00) ||
			(buf[4] === 0x4F && buf[5] === 0x54 && buf[6] === 0x54 && buf[7] === 0x4F)
		)
	) {
		return {
			ext: 'woff',
			mime: 'application/font-woff'
		};
	}

	if (
		(buf[0] === 0x77 && buf[1] === 0x4F && buf[2] === 0x46 && buf[3] === 0x32) &&
		(
			(buf[4] === 0x00 && buf[5] === 0x01 && buf[6] === 0x00 && buf[7] === 0x00) ||
			(buf[4] === 0x4F && buf[5] === 0x54 && buf[6] === 0x54 && buf[7] === 0x4F)
		)
	) {
		return {
			ext: 'woff2',
			mime: 'application/font-woff'
		};
	}

	if (
		(buf[34] === 0x4C && buf[35] === 0x50) &&
		(
			(buf[8] === 0x00 && buf[9] === 0x00 && buf[10] === 0x01) ||
			(buf[8] === 0x01 && buf[9] === 0x00 && buf[10] === 0x02) ||
			(buf[8] === 0x02 && buf[9] === 0x00 && buf[10] === 0x02)
		)
	) {
		return {
			ext: 'eot',
			mime: 'application/octet-stream'
		};
	}

	if (buf[0] === 0x00 && buf[1] === 0x01 && buf[2] === 0x00 && buf[3] === 0x00 && buf[4] === 0x00) {
		return {
			ext: 'ttf',
			mime: 'application/font-sfnt'
		};
	}

	if (buf[0] === 0x4F && buf[1] === 0x54 && buf[2] === 0x54 && buf[3] === 0x4F && buf[4] === 0x00) {
		return {
			ext: 'otf',
			mime: 'application/font-sfnt'
		};
	}

	if (buf[0] === 0x00 && buf[1] === 0x00 && buf[2] === 0x01 && buf[3] === 0x00) {
		return {
			ext: 'ico',
			mime: 'image/x-icon'
		};
	}

	if (buf[0] === 0x46 && buf[1] === 0x4C && buf[2] === 0x56 && buf[3] === 0x01) {
		return {
			ext: 'flv',
			mime: 'video/x-flv'
		};
	}

	if (buf[0] === 0x25 && buf[1] === 0x21) {
		return {
			ext: 'ps',
			mime: 'application/postscript'
		};
	}

	if (buf[0] === 0xFD && buf[1] === 0x37 && buf[2] === 0x7A && buf[3] === 0x58 && buf[4] === 0x5A && buf[5] === 0x00) {
		return {
			ext: 'xz',
			mime: 'application/x-xz'
		};
	}

	if (buf[0] === 0x53 && buf[1] === 0x51 && buf[2] === 0x4C && buf[3] === 0x69) {
		return {
			ext: 'sqlite',
			mime: 'application/x-sqlite3'
		};
	}

	if (buf[0] === 0x4E && buf[1] === 0x45 && buf[2] === 0x53 && buf[3] === 0x1A) {
		return {
			ext: 'nes',
			mime: 'application/x-nintendo-nes-rom'
		};
	}

	if (buf[0] === 0x43 && buf[1] === 0x72 && buf[2] === 0x32 && buf[3] === 0x34) {
		return {
			ext: 'crx',
			mime: 'application/x-google-chrome-extension'
		};
	}

	if (
		(buf[0] === 0x4D && buf[1] === 0x53 && buf[2] === 0x43 && buf[3] === 0x46) ||
		(buf[0] === 0x49 && buf[1] === 0x53 && buf[2] === 0x63 && buf[3] === 0x28)
	) {
		return {
			ext: 'cab',
			mime: 'application/vnd.ms-cab-compressed'
		};
	}

	// needs to be before `ar` check
	if (buf[0] === 0x21 && buf[1] === 0x3C && buf[2] === 0x61 && buf[3] === 0x72 && buf[4] === 0x63 && buf[5] === 0x68 && buf[6] === 0x3E && buf[7] === 0x0A && buf[8] === 0x64 && buf[9] === 0x65 && buf[10] === 0x62 && buf[11] === 0x69 && buf[12] === 0x61 && buf[13] === 0x6E && buf[14] === 0x2D && buf[15] === 0x62 && buf[16] === 0x69 && buf[17] === 0x6E && buf[18] === 0x61 && buf[19] === 0x72 && buf[20] === 0x79) {
		return {
			ext: 'deb',
			mime: 'application/x-deb'
		};
	}

	if (buf[0] === 0x21 && buf[1] === 0x3C && buf[2] === 0x61 && buf[3] === 0x72 && buf[4] === 0x63 && buf[5] === 0x68 && buf[6] === 0x3E) {
		return {
			ext: 'ar',
			mime: 'application/x-unix-archive'
		};
	}

	if (buf[0] === 0xED && buf[1] === 0xAB && buf[2] === 0xEE && buf[3] === 0xDB) {
		return {
			ext: 'rpm',
			mime: 'application/x-rpm'
		};
	}

	if (
		(buf[0] === 0x1F && buf[1] === 0xA0) ||
		(buf[0] === 0x1F && buf[1] === 0x9D)
	) {
		return {
			ext: 'Z',
			mime: 'application/x-compress'
		};
	}

	if (buf[0] === 0x4C && buf[1] === 0x5A && buf[2] === 0x49 && buf[3] === 0x50) {
		return {
			ext: 'lz',
			mime: 'application/x-lzip'
		};
	}

	if (buf[0] === 0xD0 && buf[1] === 0xCF && buf[2] === 0x11 && buf[3] === 0xE0 && buf[4] === 0xA1 && buf[5] === 0xB1 && buf[6] === 0x1A && buf[7] === 0xE1) {
		return {
			ext: 'msi',
			mime: 'application/x-msi'
		};
	}

	return null;
};

var getStream$7 = {exports: {}};

var pinkie;
var hasRequiredPinkie;

function requirePinkie () {
	if (hasRequiredPinkie) return pinkie;
	hasRequiredPinkie = 1;

	var PENDING = 'pending';
	var SETTLED = 'settled';
	var FULFILLED = 'fulfilled';
	var REJECTED = 'rejected';
	var NOOP = function () {};
	var isNode = typeof commonjsGlobal !== 'undefined' && typeof commonjsGlobal.process !== 'undefined' && typeof commonjsGlobal.process.emit === 'function';

	var asyncSetTimer = typeof setImmediate === 'undefined' ? setTimeout : setImmediate;
	var asyncQueue = [];
	var asyncTimer;

	function asyncFlush() {
		// run promise callbacks
		for (var i = 0; i < asyncQueue.length; i++) {
			asyncQueue[i][0](asyncQueue[i][1]);
		}

		// reset async asyncQueue
		asyncQueue = [];
		asyncTimer = false;
	}

	function asyncCall(callback, arg) {
		asyncQueue.push([callback, arg]);

		if (!asyncTimer) {
			asyncTimer = true;
			asyncSetTimer(asyncFlush, 0);
		}
	}

	function invokeResolver(resolver, promise) {
		function resolvePromise(value) {
			resolve(promise, value);
		}

		function rejectPromise(reason) {
			reject(promise, reason);
		}

		try {
			resolver(resolvePromise, rejectPromise);
		} catch (e) {
			rejectPromise(e);
		}
	}

	function invokeCallback(subscriber) {
		var owner = subscriber.owner;
		var settled = owner._state;
		var value = owner._data;
		var callback = subscriber[settled];
		var promise = subscriber.then;

		if (typeof callback === 'function') {
			settled = FULFILLED;
			try {
				value = callback(value);
			} catch (e) {
				reject(promise, e);
			}
		}

		if (!handleThenable(promise, value)) {
			if (settled === FULFILLED) {
				resolve(promise, value);
			}

			if (settled === REJECTED) {
				reject(promise, value);
			}
		}
	}

	function handleThenable(promise, value) {
		var resolved;

		try {
			if (promise === value) {
				throw new TypeError('A promises callback cannot return that same promise.');
			}

			if (value && (typeof value === 'function' || typeof value === 'object')) {
				// then should be retrieved only once
				var then = value.then;

				if (typeof then === 'function') {
					then.call(value, function (val) {
						if (!resolved) {
							resolved = true;

							if (value === val) {
								fulfill(promise, val);
							} else {
								resolve(promise, val);
							}
						}
					}, function (reason) {
						if (!resolved) {
							resolved = true;

							reject(promise, reason);
						}
					});

					return true;
				}
			}
		} catch (e) {
			if (!resolved) {
				reject(promise, e);
			}

			return true;
		}

		return false;
	}

	function resolve(promise, value) {
		if (promise === value || !handleThenable(promise, value)) {
			fulfill(promise, value);
		}
	}

	function fulfill(promise, value) {
		if (promise._state === PENDING) {
			promise._state = SETTLED;
			promise._data = value;

			asyncCall(publishFulfillment, promise);
		}
	}

	function reject(promise, reason) {
		if (promise._state === PENDING) {
			promise._state = SETTLED;
			promise._data = reason;

			asyncCall(publishRejection, promise);
		}
	}

	function publish(promise) {
		promise._then = promise._then.forEach(invokeCallback);
	}

	function publishFulfillment(promise) {
		promise._state = FULFILLED;
		publish(promise);
	}

	function publishRejection(promise) {
		promise._state = REJECTED;
		publish(promise);
		if (!promise._handled && isNode) {
			commonjsGlobal.process.emit('unhandledRejection', promise._data, promise);
		}
	}

	function notifyRejectionHandled(promise) {
		commonjsGlobal.process.emit('rejectionHandled', promise);
	}

	/**
	 * @class
	 */
	function Promise(resolver) {
		if (typeof resolver !== 'function') {
			throw new TypeError('Promise resolver ' + resolver + ' is not a function');
		}

		if (this instanceof Promise === false) {
			throw new TypeError('Failed to construct \'Promise\': Please use the \'new\' operator, this object constructor cannot be called as a function.');
		}

		this._then = [];

		invokeResolver(resolver, this);
	}

	Promise.prototype = {
		constructor: Promise,

		_state: PENDING,
		_then: null,
		_data: undefined,
		_handled: false,

		then: function (onFulfillment, onRejection) {
			var subscriber = {
				owner: this,
				then: new this.constructor(NOOP),
				fulfilled: onFulfillment,
				rejected: onRejection
			};

			if ((onRejection || onFulfillment) && !this._handled) {
				this._handled = true;
				if (this._state === REJECTED && isNode) {
					asyncCall(notifyRejectionHandled, this);
				}
			}

			if (this._state === FULFILLED || this._state === REJECTED) {
				// already resolved, call callback async
				asyncCall(invokeCallback, subscriber);
			} else {
				// subscribe
				this._then.push(subscriber);
			}

			return subscriber.then;
		},

		catch: function (onRejection) {
			return this.then(null, onRejection);
		}
	};

	Promise.all = function (promises) {
		if (!Array.isArray(promises)) {
			throw new TypeError('You must pass an array to Promise.all().');
		}

		return new Promise(function (resolve, reject) {
			var results = [];
			var remaining = 0;

			function resolver(index) {
				remaining++;
				return function (value) {
					results[index] = value;
					if (!--remaining) {
						resolve(results);
					}
				};
			}

			for (var i = 0, promise; i < promises.length; i++) {
				promise = promises[i];

				if (promise && typeof promise.then === 'function') {
					promise.then(resolver(i), reject);
				} else {
					results[i] = promise;
				}
			}

			if (!remaining) {
				resolve(results);
			}
		});
	};

	Promise.race = function (promises) {
		if (!Array.isArray(promises)) {
			throw new TypeError('You must pass an array to Promise.race().');
		}

		return new Promise(function (resolve, reject) {
			for (var i = 0, promise; i < promises.length; i++) {
				promise = promises[i];

				if (promise && typeof promise.then === 'function') {
					promise.then(resolve, reject);
				} else {
					resolve(promise);
				}
			}
		});
	};

	Promise.resolve = function (value) {
		if (value && typeof value === 'object' && value.constructor === Promise) {
			return value;
		}

		return new Promise(function (resolve) {
			resolve(value);
		});
	};

	Promise.reject = function (reason) {
		return new Promise(function (resolve, reject) {
			reject(reason);
		});
	};

	pinkie = Promise;
	return pinkie;
}

var pinkiePromise = typeof Promise === 'function' ? Promise : requirePinkie();

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var objectAssign$3 = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

var PassThrough$6 = require$$0$5.PassThrough;
var objectAssign$2 = objectAssign$3;

var bufferStream$3 = function (opts) {
	opts = objectAssign$2({}, opts);

	var array = opts.array;
	var encoding = opts.encoding;

	var buffer = encoding === 'buffer';
	var objectMode = false;

	if (array) {
		objectMode = !(encoding || buffer);
	} else {
		encoding = encoding || 'utf8';
	}

	if (buffer) {
		encoding = null;
	}

	var len = 0;
	var ret = [];

	var stream = new PassThrough$6({objectMode: objectMode});

	if (encoding) {
		stream.setEncoding(encoding);
	}

	stream.on('data', function (chunk) {
		ret.push(chunk);

		if (objectMode) {
			len = ret.length;
		} else {
			len += chunk.length;
		}
	});

	stream.getBufferedValue = function () {
		if (array) {
			return ret;
		}
		return buffer ? Buffer.concat(ret, len) : ret.join('');
	};

	stream.getBufferedLength = function () {
		return len;
	};

	return stream;
};

var Promise$1 = pinkiePromise;
var objectAssign$1 = objectAssign$3;
var bufferStream$2 = bufferStream$3;

function getStream$6(inputStream, opts) {
	if (!inputStream) {
		return Promise$1.reject(new Error('Expected a stream'));
	}

	opts = objectAssign$1({maxBuffer: Infinity}, opts);
	var maxBuffer = opts.maxBuffer;
	var stream;
	var clean;

	var p = new Promise$1(function (resolve, reject) {
		stream = bufferStream$2(opts);
		inputStream.once('error', error);
		inputStream.pipe(stream);

		stream.on('data', function () {
			if (stream.getBufferedLength() > maxBuffer) {
				reject(new Error('maxBuffer exceeded'));
			}
		});
		stream.once('error', error);
		stream.on('end', resolve);

		clean = function () {
			// some streams doesn't implement the stream.Readable interface correctly
			if (inputStream.unpipe) {
				inputStream.unpipe(stream);
			}
		};

		function error(err) {
			if (err) { // null check
				err.bufferedData = stream.getBufferedValue();
			}
			reject(err);
		}
	});

	p.then(clean, clean);

	return p.then(function () {
		return stream.getBufferedValue();
	});
}

getStream$7.exports = getStream$6;

getStream$7.exports.buffer = function (stream, opts) {
	return getStream$6(stream, objectAssign$1({}, opts, {encoding: 'buffer'}));
};

getStream$7.exports.array = function (stream, opts) {
	return getStream$6(stream, objectAssign$1({}, opts, {array: true}));
};

var getStreamExports$1 = getStream$7.exports;

var pify$7 = {exports: {}};

var processFn$1 = function (fn, P, opts) {
	return function () {
		var that = this;
		var args = new Array(arguments.length);

		for (var i = 0; i < arguments.length; i++) {
			args[i] = arguments[i];
		}

		return new P(function (resolve, reject) {
			args.push(function (err, result) {
				if (err) {
					reject(err);
				} else if (opts.multiArgs) {
					var results = new Array(arguments.length - 1);

					for (var i = 1; i < arguments.length; i++) {
						results[i - 1] = arguments[i];
					}

					resolve(results);
				} else {
					resolve(result);
				}
			});

			fn.apply(that, args);
		});
	};
};

var pify$6 = pify$7.exports = function (obj, P, opts) {
	if (typeof P !== 'function') {
		opts = P;
		P = Promise;
	}

	opts = opts || {};
	opts.exclude = opts.exclude || [/.+Sync$/];

	var filter = function (key) {
		var match = function (pattern) {
			return typeof pattern === 'string' ? key === pattern : pattern.test(key);
		};

		return opts.include ? opts.include.some(match) : !opts.exclude.some(match);
	};

	var ret = typeof obj === 'function' ? function () {
		if (opts.excludeMain) {
			return obj.apply(this, arguments);
		}

		return processFn$1(obj, P, opts).apply(this, arguments);
	} : {};

	return Object.keys(obj).reduce(function (ret, key) {
		var x = obj[key];

		ret[key] = typeof x === 'function' && filter(key) ? processFn$1(x, P, opts) : x;

		return ret;
	}, ret);
};

pify$6.all = pify$6;

var pifyExports = pify$7.exports;

var yauzl$1 = {};

var fdSlicer = {};

var pend = Pend$1;

function Pend$1() {
  this.pending = 0;
  this.max = Infinity;
  this.listeners = [];
  this.waiting = [];
  this.error = null;
}

Pend$1.prototype.go = function(fn) {
  if (this.pending < this.max) {
    pendGo(this, fn);
  } else {
    this.waiting.push(fn);
  }
};

Pend$1.prototype.wait = function(cb) {
  if (this.pending === 0) {
    cb(this.error);
  } else {
    this.listeners.push(cb);
  }
};

Pend$1.prototype.hold = function() {
  return pendHold(this);
};

function pendHold(self) {
  self.pending += 1;
  var called = false;
  return onCb;
  function onCb(err) {
    if (called) throw new Error("callback called twice");
    called = true;
    self.error = self.error || err;
    self.pending -= 1;
    if (self.waiting.length > 0 && self.pending < self.max) {
      pendGo(self, self.waiting.shift());
    } else if (self.pending === 0) {
      var listeners = self.listeners;
      self.listeners = [];
      listeners.forEach(cbListener);
    }
  }
  function cbListener(listener) {
    listener(self.error);
  }
}

function pendGo(self, fn) {
  fn(pendHold(self));
}

var fs$6 = require$$0$3;
var util$2 = require$$0$8;
var stream$1 = require$$0$5;
var Readable$2 = stream$1.Readable;
var Writable$1 = stream$1.Writable;
var PassThrough$5 = stream$1.PassThrough;
var Pend = pend;
var EventEmitter$4 = require$$4.EventEmitter;

fdSlicer.createFromBuffer = createFromBuffer;
fdSlicer.createFromFd = createFromFd;
fdSlicer.BufferSlicer = BufferSlicer;
fdSlicer.FdSlicer = FdSlicer;

util$2.inherits(FdSlicer, EventEmitter$4);
function FdSlicer(fd, options) {
  options = options || {};
  EventEmitter$4.call(this);

  this.fd = fd;
  this.pend = new Pend();
  this.pend.max = 1;
  this.refCount = 0;
  this.autoClose = !!options.autoClose;
}

FdSlicer.prototype.read = function(buffer, offset, length, position, callback) {
  var self = this;
  self.pend.go(function(cb) {
    fs$6.read(self.fd, buffer, offset, length, position, function(err, bytesRead, buffer) {
      cb();
      callback(err, bytesRead, buffer);
    });
  });
};

FdSlicer.prototype.write = function(buffer, offset, length, position, callback) {
  var self = this;
  self.pend.go(function(cb) {
    fs$6.write(self.fd, buffer, offset, length, position, function(err, written, buffer) {
      cb();
      callback(err, written, buffer);
    });
  });
};

FdSlicer.prototype.createReadStream = function(options) {
  return new ReadStream(this, options);
};

FdSlicer.prototype.createWriteStream = function(options) {
  return new WriteStream(this, options);
};

FdSlicer.prototype.ref = function() {
  this.refCount += 1;
};

FdSlicer.prototype.unref = function() {
  var self = this;
  self.refCount -= 1;

  if (self.refCount > 0) return;
  if (self.refCount < 0) throw new Error("invalid unref");

  if (self.autoClose) {
    fs$6.close(self.fd, onCloseDone);
  }

  function onCloseDone(err) {
    if (err) {
      self.emit('error', err);
    } else {
      self.emit('close');
    }
  }
};

util$2.inherits(ReadStream, Readable$2);
function ReadStream(context, options) {
  options = options || {};
  Readable$2.call(this, options);

  this.context = context;
  this.context.ref();

  this.start = options.start || 0;
  this.endOffset = options.end;
  this.pos = this.start;
  this.destroyed = false;
}

ReadStream.prototype._read = function(n) {
  var self = this;
  if (self.destroyed) return;

  var toRead = Math.min(self._readableState.highWaterMark, n);
  if (self.endOffset != null) {
    toRead = Math.min(toRead, self.endOffset - self.pos);
  }
  if (toRead <= 0) {
    self.destroyed = true;
    self.push(null);
    self.context.unref();
    return;
  }
  self.context.pend.go(function(cb) {
    if (self.destroyed) return cb();
    var buffer = new Buffer(toRead);
    fs$6.read(self.context.fd, buffer, 0, toRead, self.pos, function(err, bytesRead) {
      if (err) {
        self.destroy(err);
      } else if (bytesRead === 0) {
        self.destroyed = true;
        self.push(null);
        self.context.unref();
      } else {
        self.pos += bytesRead;
        self.push(buffer.slice(0, bytesRead));
      }
      cb();
    });
  });
};

ReadStream.prototype.destroy = function(err) {
  if (this.destroyed) return;
  err = err || new Error("stream destroyed");
  this.destroyed = true;
  this.emit('error', err);
  this.context.unref();
};

util$2.inherits(WriteStream, Writable$1);
function WriteStream(context, options) {
  options = options || {};
  Writable$1.call(this, options);

  this.context = context;
  this.context.ref();

  this.start = options.start || 0;
  this.endOffset = (options.end == null) ? Infinity : +options.end;
  this.bytesWritten = 0;
  this.pos = this.start;
  this.destroyed = false;

  this.on('finish', this.destroy.bind(this));
}

WriteStream.prototype._write = function(buffer, encoding, callback) {
  var self = this;
  if (self.destroyed) return;

  if (self.pos + buffer.length > self.endOffset) {
    var err = new Error("maximum file length exceeded");
    err.code = 'ETOOBIG';
    self.destroy();
    callback(err);
    return;
  }
  self.context.pend.go(function(cb) {
    if (self.destroyed) return cb();
    fs$6.write(self.context.fd, buffer, 0, buffer.length, self.pos, function(err, bytes) {
      if (err) {
        self.destroy();
        cb();
        callback(err);
      } else {
        self.bytesWritten += bytes;
        self.pos += bytes;
        self.emit('progress');
        cb();
        callback();
      }
    });
  });
};

WriteStream.prototype.destroy = function() {
  if (this.destroyed) return;
  this.destroyed = true;
  this.context.unref();
};

util$2.inherits(BufferSlicer, EventEmitter$4);
function BufferSlicer(buffer, options) {
  EventEmitter$4.call(this);

  options = options || {};
  this.refCount = 0;
  this.buffer = buffer;
  this.maxChunkSize = options.maxChunkSize || Number.MAX_SAFE_INTEGER;
}

BufferSlicer.prototype.read = function(buffer, offset, length, position, callback) {
  var end = position + length;
  var delta = end - this.buffer.length;
  var written = (delta > 0) ? delta : length;
  this.buffer.copy(buffer, offset, position, end);
  setImmediate(function() {
    callback(null, written);
  });
};

BufferSlicer.prototype.write = function(buffer, offset, length, position, callback) {
  buffer.copy(this.buffer, position, offset, offset + length);
  setImmediate(function() {
    callback(null, length, buffer);
  });
};

BufferSlicer.prototype.createReadStream = function(options) {
  options = options || {};
  var readStream = new PassThrough$5(options);
  readStream.destroyed = false;
  readStream.start = options.start || 0;
  readStream.endOffset = options.end;
  // by the time this function returns, we'll be done.
  readStream.pos = readStream.endOffset || this.buffer.length;

  // respect the maxChunkSize option to slice up the chunk into smaller pieces.
  var entireSlice = this.buffer.slice(readStream.start, readStream.pos);
  var offset = 0;
  while (true) {
    var nextOffset = offset + this.maxChunkSize;
    if (nextOffset >= entireSlice.length) {
      // last chunk
      if (offset < entireSlice.length) {
        readStream.write(entireSlice.slice(offset, entireSlice.length));
      }
      break;
    }
    readStream.write(entireSlice.slice(offset, nextOffset));
    offset = nextOffset;
  }

  readStream.end();
  readStream.destroy = function() {
    readStream.destroyed = true;
  };
  return readStream;
};

BufferSlicer.prototype.createWriteStream = function(options) {
  var bufferSlicer = this;
  options = options || {};
  var writeStream = new Writable$1(options);
  writeStream.start = options.start || 0;
  writeStream.endOffset = (options.end == null) ? this.buffer.length : +options.end;
  writeStream.bytesWritten = 0;
  writeStream.pos = writeStream.start;
  writeStream.destroyed = false;
  writeStream._write = function(buffer, encoding, callback) {
    if (writeStream.destroyed) return;

    var end = writeStream.pos + buffer.length;
    if (end > writeStream.endOffset) {
      var err = new Error("maximum file length exceeded");
      err.code = 'ETOOBIG';
      writeStream.destroyed = true;
      callback(err);
      return;
    }
    buffer.copy(bufferSlicer.buffer, writeStream.pos, 0, buffer.length);

    writeStream.bytesWritten += buffer.length;
    writeStream.pos = end;
    writeStream.emit('progress');
    callback();
  };
  writeStream.destroy = function() {
    writeStream.destroyed = true;
  };
  return writeStream;
};

BufferSlicer.prototype.ref = function() {
  this.refCount += 1;
};

BufferSlicer.prototype.unref = function() {
  this.refCount -= 1;

  if (this.refCount < 0) {
    throw new Error("invalid unref");
  }
};

function createFromBuffer(buffer, options) {
  return new BufferSlicer(buffer, options);
}

function createFromFd(fd, options) {
  return new FdSlicer(fd, options);
}

var Buffer$2 = require$$0$7.Buffer;

var CRC_TABLE = [
  0x00000000, 0x77073096, 0xee0e612c, 0x990951ba, 0x076dc419,
  0x706af48f, 0xe963a535, 0x9e6495a3, 0x0edb8832, 0x79dcb8a4,
  0xe0d5e91e, 0x97d2d988, 0x09b64c2b, 0x7eb17cbd, 0xe7b82d07,
  0x90bf1d91, 0x1db71064, 0x6ab020f2, 0xf3b97148, 0x84be41de,
  0x1adad47d, 0x6ddde4eb, 0xf4d4b551, 0x83d385c7, 0x136c9856,
  0x646ba8c0, 0xfd62f97a, 0x8a65c9ec, 0x14015c4f, 0x63066cd9,
  0xfa0f3d63, 0x8d080df5, 0x3b6e20c8, 0x4c69105e, 0xd56041e4,
  0xa2677172, 0x3c03e4d1, 0x4b04d447, 0xd20d85fd, 0xa50ab56b,
  0x35b5a8fa, 0x42b2986c, 0xdbbbc9d6, 0xacbcf940, 0x32d86ce3,
  0x45df5c75, 0xdcd60dcf, 0xabd13d59, 0x26d930ac, 0x51de003a,
  0xc8d75180, 0xbfd06116, 0x21b4f4b5, 0x56b3c423, 0xcfba9599,
  0xb8bda50f, 0x2802b89e, 0x5f058808, 0xc60cd9b2, 0xb10be924,
  0x2f6f7c87, 0x58684c11, 0xc1611dab, 0xb6662d3d, 0x76dc4190,
  0x01db7106, 0x98d220bc, 0xefd5102a, 0x71b18589, 0x06b6b51f,
  0x9fbfe4a5, 0xe8b8d433, 0x7807c9a2, 0x0f00f934, 0x9609a88e,
  0xe10e9818, 0x7f6a0dbb, 0x086d3d2d, 0x91646c97, 0xe6635c01,
  0x6b6b51f4, 0x1c6c6162, 0x856530d8, 0xf262004e, 0x6c0695ed,
  0x1b01a57b, 0x8208f4c1, 0xf50fc457, 0x65b0d9c6, 0x12b7e950,
  0x8bbeb8ea, 0xfcb9887c, 0x62dd1ddf, 0x15da2d49, 0x8cd37cf3,
  0xfbd44c65, 0x4db26158, 0x3ab551ce, 0xa3bc0074, 0xd4bb30e2,
  0x4adfa541, 0x3dd895d7, 0xa4d1c46d, 0xd3d6f4fb, 0x4369e96a,
  0x346ed9fc, 0xad678846, 0xda60b8d0, 0x44042d73, 0x33031de5,
  0xaa0a4c5f, 0xdd0d7cc9, 0x5005713c, 0x270241aa, 0xbe0b1010,
  0xc90c2086, 0x5768b525, 0x206f85b3, 0xb966d409, 0xce61e49f,
  0x5edef90e, 0x29d9c998, 0xb0d09822, 0xc7d7a8b4, 0x59b33d17,
  0x2eb40d81, 0xb7bd5c3b, 0xc0ba6cad, 0xedb88320, 0x9abfb3b6,
  0x03b6e20c, 0x74b1d29a, 0xead54739, 0x9dd277af, 0x04db2615,
  0x73dc1683, 0xe3630b12, 0x94643b84, 0x0d6d6a3e, 0x7a6a5aa8,
  0xe40ecf0b, 0x9309ff9d, 0x0a00ae27, 0x7d079eb1, 0xf00f9344,
  0x8708a3d2, 0x1e01f268, 0x6906c2fe, 0xf762575d, 0x806567cb,
  0x196c3671, 0x6e6b06e7, 0xfed41b76, 0x89d32be0, 0x10da7a5a,
  0x67dd4acc, 0xf9b9df6f, 0x8ebeeff9, 0x17b7be43, 0x60b08ed5,
  0xd6d6a3e8, 0xa1d1937e, 0x38d8c2c4, 0x4fdff252, 0xd1bb67f1,
  0xa6bc5767, 0x3fb506dd, 0x48b2364b, 0xd80d2bda, 0xaf0a1b4c,
  0x36034af6, 0x41047a60, 0xdf60efc3, 0xa867df55, 0x316e8eef,
  0x4669be79, 0xcb61b38c, 0xbc66831a, 0x256fd2a0, 0x5268e236,
  0xcc0c7795, 0xbb0b4703, 0x220216b9, 0x5505262f, 0xc5ba3bbe,
  0xb2bd0b28, 0x2bb45a92, 0x5cb36a04, 0xc2d7ffa7, 0xb5d0cf31,
  0x2cd99e8b, 0x5bdeae1d, 0x9b64c2b0, 0xec63f226, 0x756aa39c,
  0x026d930a, 0x9c0906a9, 0xeb0e363f, 0x72076785, 0x05005713,
  0x95bf4a82, 0xe2b87a14, 0x7bb12bae, 0x0cb61b38, 0x92d28e9b,
  0xe5d5be0d, 0x7cdcefb7, 0x0bdbdf21, 0x86d3d2d4, 0xf1d4e242,
  0x68ddb3f8, 0x1fda836e, 0x81be16cd, 0xf6b9265b, 0x6fb077e1,
  0x18b74777, 0x88085ae6, 0xff0f6a70, 0x66063bca, 0x11010b5c,
  0x8f659eff, 0xf862ae69, 0x616bffd3, 0x166ccf45, 0xa00ae278,
  0xd70dd2ee, 0x4e048354, 0x3903b3c2, 0xa7672661, 0xd06016f7,
  0x4969474d, 0x3e6e77db, 0xaed16a4a, 0xd9d65adc, 0x40df0b66,
  0x37d83bf0, 0xa9bcae53, 0xdebb9ec5, 0x47b2cf7f, 0x30b5ffe9,
  0xbdbdf21c, 0xcabac28a, 0x53b39330, 0x24b4a3a6, 0xbad03605,
  0xcdd70693, 0x54de5729, 0x23d967bf, 0xb3667a2e, 0xc4614ab8,
  0x5d681b02, 0x2a6f2b94, 0xb40bbe37, 0xc30c8ea1, 0x5a05df1b,
  0x2d02ef8d
];

if (typeof Int32Array !== 'undefined') {
  CRC_TABLE = new Int32Array(CRC_TABLE);
}

function ensureBuffer(input) {
  if (Buffer$2.isBuffer(input)) {
    return input;
  }

  var hasNewBufferAPI =
      typeof Buffer$2.alloc === "function" &&
      typeof Buffer$2.from === "function";

  if (typeof input === "number") {
    return hasNewBufferAPI ? Buffer$2.alloc(input) : new Buffer$2(input);
  }
  else if (typeof input === "string") {
    return hasNewBufferAPI ? Buffer$2.from(input) : new Buffer$2(input);
  }
  else {
    throw new Error("input must be buffer, number, or string, received " +
                    typeof input);
  }
}

function bufferizeInt(num) {
  var tmp = ensureBuffer(4);
  tmp.writeInt32BE(num, 0);
  return tmp;
}

function _crc32(buf, previous) {
  buf = ensureBuffer(buf);
  if (Buffer$2.isBuffer(previous)) {
    previous = previous.readUInt32BE(0);
  }
  var crc = ~~previous ^ -1;
  for (var n = 0; n < buf.length; n++) {
    crc = CRC_TABLE[(crc ^ buf[n]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ -1);
}

function crc32$1() {
  return bufferizeInt(_crc32.apply(null, arguments));
}
crc32$1.signed = function () {
  return _crc32.apply(null, arguments);
};
crc32$1.unsigned = function () {
  return _crc32.apply(null, arguments) >>> 0;
};

var bufferCrc32 = crc32$1;

var fs$5 = require$$0$3;
var zlib$1 = require$$1$4;
var fd_slicer = fdSlicer;
var crc32 = bufferCrc32;
var util$1 = require$$0$8;
var EventEmitter$3 = require$$4.EventEmitter;
var Transform$1 = require$$0$5.Transform;
var PassThrough$4 = require$$0$5.PassThrough;
var Writable = require$$0$5.Writable;

yauzl$1.open = open;
yauzl$1.fromFd = fromFd;
yauzl$1.fromBuffer = fromBuffer;
yauzl$1.fromRandomAccessReader = fromRandomAccessReader;
yauzl$1.dosDateTimeToDate = dosDateTimeToDate;
yauzl$1.validateFileName = validateFileName;
yauzl$1.ZipFile = ZipFile;
yauzl$1.Entry = Entry;
yauzl$1.RandomAccessReader = RandomAccessReader;

function open(path, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  if (options == null) options = {};
  if (options.autoClose == null) options.autoClose = true;
  if (options.lazyEntries == null) options.lazyEntries = false;
  if (options.decodeStrings == null) options.decodeStrings = true;
  if (options.validateEntrySizes == null) options.validateEntrySizes = true;
  if (options.strictFileNames == null) options.strictFileNames = false;
  if (callback == null) callback = defaultCallback;
  fs$5.open(path, "r", function(err, fd) {
    if (err) return callback(err);
    fromFd(fd, options, function(err, zipfile) {
      if (err) fs$5.close(fd, defaultCallback);
      callback(err, zipfile);
    });
  });
}

function fromFd(fd, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  if (options == null) options = {};
  if (options.autoClose == null) options.autoClose = false;
  if (options.lazyEntries == null) options.lazyEntries = false;
  if (options.decodeStrings == null) options.decodeStrings = true;
  if (options.validateEntrySizes == null) options.validateEntrySizes = true;
  if (options.strictFileNames == null) options.strictFileNames = false;
  if (callback == null) callback = defaultCallback;
  fs$5.fstat(fd, function(err, stats) {
    if (err) return callback(err);
    var reader = fd_slicer.createFromFd(fd, {autoClose: true});
    fromRandomAccessReader(reader, stats.size, options, callback);
  });
}

function fromBuffer(buffer, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  if (options == null) options = {};
  options.autoClose = false;
  if (options.lazyEntries == null) options.lazyEntries = false;
  if (options.decodeStrings == null) options.decodeStrings = true;
  if (options.validateEntrySizes == null) options.validateEntrySizes = true;
  if (options.strictFileNames == null) options.strictFileNames = false;
  // limit the max chunk size. see https://github.com/thejoshwolfe/yauzl/issues/87
  var reader = fd_slicer.createFromBuffer(buffer, {maxChunkSize: 0x10000});
  fromRandomAccessReader(reader, buffer.length, options, callback);
}

function fromRandomAccessReader(reader, totalSize, options, callback) {
  if (typeof options === "function") {
    callback = options;
    options = null;
  }
  if (options == null) options = {};
  if (options.autoClose == null) options.autoClose = true;
  if (options.lazyEntries == null) options.lazyEntries = false;
  if (options.decodeStrings == null) options.decodeStrings = true;
  var decodeStrings = !!options.decodeStrings;
  if (options.validateEntrySizes == null) options.validateEntrySizes = true;
  if (options.strictFileNames == null) options.strictFileNames = false;
  if (callback == null) callback = defaultCallback;
  if (typeof totalSize !== "number") throw new Error("expected totalSize parameter to be a number");
  if (totalSize > Number.MAX_SAFE_INTEGER) {
    throw new Error("zip file too large. only file sizes up to 2^52 are supported due to JavaScript's Number type being an IEEE 754 double.");
  }

  // the matching unref() call is in zipfile.close()
  reader.ref();

  // eocdr means End of Central Directory Record.
  // search backwards for the eocdr signature.
  // the last field of the eocdr is a variable-length comment.
  // the comment size is encoded in a 2-byte field in the eocdr, which we can't find without trudging backwards through the comment to find it.
  // as a consequence of this design decision, it's possible to have ambiguous zip file metadata if a coherent eocdr was in the comment.
  // we search backwards for a eocdr signature, and hope that whoever made the zip file was smart enough to forbid the eocdr signature in the comment.
  var eocdrWithoutCommentSize = 22;
  var maxCommentSize = 0xffff; // 2-byte size
  var bufferSize = Math.min(eocdrWithoutCommentSize + maxCommentSize, totalSize);
  var buffer = newBuffer(bufferSize);
  var bufferReadStart = totalSize - buffer.length;
  readAndAssertNoEof(reader, buffer, 0, bufferSize, bufferReadStart, function(err) {
    if (err) return callback(err);
    for (var i = bufferSize - eocdrWithoutCommentSize; i >= 0; i -= 1) {
      if (buffer.readUInt32LE(i) !== 0x06054b50) continue;
      // found eocdr
      var eocdrBuffer = buffer.slice(i);

      // 0 - End of central directory signature = 0x06054b50
      // 4 - Number of this disk
      var diskNumber = eocdrBuffer.readUInt16LE(4);
      if (diskNumber !== 0) {
        return callback(new Error("multi-disk zip files are not supported: found disk number: " + diskNumber));
      }
      // 6 - Disk where central directory starts
      // 8 - Number of central directory records on this disk
      // 10 - Total number of central directory records
      var entryCount = eocdrBuffer.readUInt16LE(10);
      // 12 - Size of central directory (bytes)
      // 16 - Offset of start of central directory, relative to start of archive
      var centralDirectoryOffset = eocdrBuffer.readUInt32LE(16);
      // 20 - Comment length
      var commentLength = eocdrBuffer.readUInt16LE(20);
      var expectedCommentLength = eocdrBuffer.length - eocdrWithoutCommentSize;
      if (commentLength !== expectedCommentLength) {
        return callback(new Error("invalid comment length. expected: " + expectedCommentLength + ". found: " + commentLength));
      }
      // 22 - Comment
      // the encoding is always cp437.
      var comment = decodeStrings ? decodeBuffer(eocdrBuffer, 22, eocdrBuffer.length, false)
                                  : eocdrBuffer.slice(22);

      if (!(entryCount === 0xffff || centralDirectoryOffset === 0xffffffff)) {
        return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options.autoClose, options.lazyEntries, decodeStrings, options.validateEntrySizes, options.strictFileNames));
      }

      // ZIP64 format

      // ZIP64 Zip64 end of central directory locator
      var zip64EocdlBuffer = newBuffer(20);
      var zip64EocdlOffset = bufferReadStart + i - zip64EocdlBuffer.length;
      readAndAssertNoEof(reader, zip64EocdlBuffer, 0, zip64EocdlBuffer.length, zip64EocdlOffset, function(err) {
        if (err) return callback(err);

        // 0 - zip64 end of central dir locator signature = 0x07064b50
        if (zip64EocdlBuffer.readUInt32LE(0) !== 0x07064b50) {
          return callback(new Error("invalid zip64 end of central directory locator signature"));
        }
        // 4 - number of the disk with the start of the zip64 end of central directory
        // 8 - relative offset of the zip64 end of central directory record
        var zip64EocdrOffset = readUInt64LE(zip64EocdlBuffer, 8);
        // 16 - total number of disks

        // ZIP64 end of central directory record
        var zip64EocdrBuffer = newBuffer(56);
        readAndAssertNoEof(reader, zip64EocdrBuffer, 0, zip64EocdrBuffer.length, zip64EocdrOffset, function(err) {
          if (err) return callback(err);

          // 0 - zip64 end of central dir signature                           4 bytes  (0x06064b50)
          if (zip64EocdrBuffer.readUInt32LE(0) !== 0x06064b50) {
            return callback(new Error("invalid zip64 end of central directory record signature"));
          }
          // 4 - size of zip64 end of central directory record                8 bytes
          // 12 - version made by                                             2 bytes
          // 14 - version needed to extract                                   2 bytes
          // 16 - number of this disk                                         4 bytes
          // 20 - number of the disk with the start of the central directory  4 bytes
          // 24 - total number of entries in the central directory on this disk         8 bytes
          // 32 - total number of entries in the central directory            8 bytes
          entryCount = readUInt64LE(zip64EocdrBuffer, 32);
          // 40 - size of the central directory                               8 bytes
          // 48 - offset of start of central directory with respect to the starting disk number     8 bytes
          centralDirectoryOffset = readUInt64LE(zip64EocdrBuffer, 48);
          // 56 - zip64 extensible data sector                                (variable size)
          return callback(null, new ZipFile(reader, centralDirectoryOffset, totalSize, entryCount, comment, options.autoClose, options.lazyEntries, decodeStrings, options.validateEntrySizes, options.strictFileNames));
        });
      });
      return;
    }
    callback(new Error("end of central directory record signature not found"));
  });
}

util$1.inherits(ZipFile, EventEmitter$3);
function ZipFile(reader, centralDirectoryOffset, fileSize, entryCount, comment, autoClose, lazyEntries, decodeStrings, validateEntrySizes, strictFileNames) {
  var self = this;
  EventEmitter$3.call(self);
  self.reader = reader;
  // forward close events
  self.reader.on("error", function(err) {
    // error closing the fd
    emitError(self, err);
  });
  self.reader.once("close", function() {
    self.emit("close");
  });
  self.readEntryCursor = centralDirectoryOffset;
  self.fileSize = fileSize;
  self.entryCount = entryCount;
  self.comment = comment;
  self.entriesRead = 0;
  self.autoClose = !!autoClose;
  self.lazyEntries = !!lazyEntries;
  self.decodeStrings = !!decodeStrings;
  self.validateEntrySizes = !!validateEntrySizes;
  self.strictFileNames = !!strictFileNames;
  self.isOpen = true;
  self.emittedError = false;

  if (!self.lazyEntries) self._readEntry();
}
ZipFile.prototype.close = function() {
  if (!this.isOpen) return;
  this.isOpen = false;
  this.reader.unref();
};

function emitErrorAndAutoClose(self, err) {
  if (self.autoClose) self.close();
  emitError(self, err);
}
function emitError(self, err) {
  if (self.emittedError) return;
  self.emittedError = true;
  self.emit("error", err);
}

ZipFile.prototype.readEntry = function() {
  if (!this.lazyEntries) throw new Error("readEntry() called without lazyEntries:true");
  this._readEntry();
};
ZipFile.prototype._readEntry = function() {
  var self = this;
  if (self.entryCount === self.entriesRead) {
    // done with metadata
    setImmediate(function() {
      if (self.autoClose) self.close();
      if (self.emittedError) return;
      self.emit("end");
    });
    return;
  }
  if (self.emittedError) return;
  var buffer = newBuffer(46);
  readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err) {
    if (err) return emitErrorAndAutoClose(self, err);
    if (self.emittedError) return;
    var entry = new Entry();
    // 0 - Central directory file header signature
    var signature = buffer.readUInt32LE(0);
    if (signature !== 0x02014b50) return emitErrorAndAutoClose(self, new Error("invalid central directory file header signature: 0x" + signature.toString(16)));
    // 4 - Version made by
    entry.versionMadeBy = buffer.readUInt16LE(4);
    // 6 - Version needed to extract (minimum)
    entry.versionNeededToExtract = buffer.readUInt16LE(6);
    // 8 - General purpose bit flag
    entry.generalPurposeBitFlag = buffer.readUInt16LE(8);
    // 10 - Compression method
    entry.compressionMethod = buffer.readUInt16LE(10);
    // 12 - File last modification time
    entry.lastModFileTime = buffer.readUInt16LE(12);
    // 14 - File last modification date
    entry.lastModFileDate = buffer.readUInt16LE(14);
    // 16 - CRC-32
    entry.crc32 = buffer.readUInt32LE(16);
    // 20 - Compressed size
    entry.compressedSize = buffer.readUInt32LE(20);
    // 24 - Uncompressed size
    entry.uncompressedSize = buffer.readUInt32LE(24);
    // 28 - File name length (n)
    entry.fileNameLength = buffer.readUInt16LE(28);
    // 30 - Extra field length (m)
    entry.extraFieldLength = buffer.readUInt16LE(30);
    // 32 - File comment length (k)
    entry.fileCommentLength = buffer.readUInt16LE(32);
    // 34 - Disk number where file starts
    // 36 - Internal file attributes
    entry.internalFileAttributes = buffer.readUInt16LE(36);
    // 38 - External file attributes
    entry.externalFileAttributes = buffer.readUInt32LE(38);
    // 42 - Relative offset of local file header
    entry.relativeOffsetOfLocalHeader = buffer.readUInt32LE(42);

    if (entry.generalPurposeBitFlag & 0x40) return emitErrorAndAutoClose(self, new Error("strong encryption is not supported"));

    self.readEntryCursor += 46;

    buffer = newBuffer(entry.fileNameLength + entry.extraFieldLength + entry.fileCommentLength);
    readAndAssertNoEof(self.reader, buffer, 0, buffer.length, self.readEntryCursor, function(err) {
      if (err) return emitErrorAndAutoClose(self, err);
      if (self.emittedError) return;
      // 46 - File name
      var isUtf8 = (entry.generalPurposeBitFlag & 0x800) !== 0;
      entry.fileName = self.decodeStrings ? decodeBuffer(buffer, 0, entry.fileNameLength, isUtf8)
                                          : buffer.slice(0, entry.fileNameLength);

      // 46+n - Extra field
      var fileCommentStart = entry.fileNameLength + entry.extraFieldLength;
      var extraFieldBuffer = buffer.slice(entry.fileNameLength, fileCommentStart);
      entry.extraFields = [];
      var i = 0;
      while (i < extraFieldBuffer.length - 3) {
        var headerId = extraFieldBuffer.readUInt16LE(i + 0);
        var dataSize = extraFieldBuffer.readUInt16LE(i + 2);
        var dataStart = i + 4;
        var dataEnd = dataStart + dataSize;
        if (dataEnd > extraFieldBuffer.length) return emitErrorAndAutoClose(self, new Error("extra field length exceeds extra field buffer size"));
        var dataBuffer = newBuffer(dataSize);
        extraFieldBuffer.copy(dataBuffer, 0, dataStart, dataEnd);
        entry.extraFields.push({
          id: headerId,
          data: dataBuffer,
        });
        i = dataEnd;
      }

      // 46+n+m - File comment
      entry.fileComment = self.decodeStrings ? decodeBuffer(buffer, fileCommentStart, fileCommentStart + entry.fileCommentLength, isUtf8)
                                             : buffer.slice(fileCommentStart, fileCommentStart + entry.fileCommentLength);
      // compatibility hack for https://github.com/thejoshwolfe/yauzl/issues/47
      entry.comment = entry.fileComment;

      self.readEntryCursor += buffer.length;
      self.entriesRead += 1;

      if (entry.uncompressedSize            === 0xffffffff ||
          entry.compressedSize              === 0xffffffff ||
          entry.relativeOffsetOfLocalHeader === 0xffffffff) {
        // ZIP64 format
        // find the Zip64 Extended Information Extra Field
        var zip64EiefBuffer = null;
        for (var i = 0; i < entry.extraFields.length; i++) {
          var extraField = entry.extraFields[i];
          if (extraField.id === 0x0001) {
            zip64EiefBuffer = extraField.data;
            break;
          }
        }
        if (zip64EiefBuffer == null) {
          return emitErrorAndAutoClose(self, new Error("expected zip64 extended information extra field"));
        }
        var index = 0;
        // 0 - Original Size          8 bytes
        if (entry.uncompressedSize === 0xffffffff) {
          if (index + 8 > zip64EiefBuffer.length) {
            return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include uncompressed size"));
          }
          entry.uncompressedSize = readUInt64LE(zip64EiefBuffer, index);
          index += 8;
        }
        // 8 - Compressed Size        8 bytes
        if (entry.compressedSize === 0xffffffff) {
          if (index + 8 > zip64EiefBuffer.length) {
            return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include compressed size"));
          }
          entry.compressedSize = readUInt64LE(zip64EiefBuffer, index);
          index += 8;
        }
        // 16 - Relative Header Offset 8 bytes
        if (entry.relativeOffsetOfLocalHeader === 0xffffffff) {
          if (index + 8 > zip64EiefBuffer.length) {
            return emitErrorAndAutoClose(self, new Error("zip64 extended information extra field does not include relative header offset"));
          }
          entry.relativeOffsetOfLocalHeader = readUInt64LE(zip64EiefBuffer, index);
          index += 8;
        }
        // 24 - Disk Start Number      4 bytes
      }

      // check for Info-ZIP Unicode Path Extra Field (0x7075)
      // see https://github.com/thejoshwolfe/yauzl/issues/33
      if (self.decodeStrings) {
        for (var i = 0; i < entry.extraFields.length; i++) {
          var extraField = entry.extraFields[i];
          if (extraField.id === 0x7075) {
            if (extraField.data.length < 6) {
              // too short to be meaningful
              continue;
            }
            // Version       1 byte      version of this extra field, currently 1
            if (extraField.data.readUInt8(0) !== 1) {
              // > Changes may not be backward compatible so this extra
              // > field should not be used if the version is not recognized.
              continue;
            }
            // NameCRC32     4 bytes     File Name Field CRC32 Checksum
            var oldNameCrc32 = extraField.data.readUInt32LE(1);
            if (crc32.unsigned(buffer.slice(0, entry.fileNameLength)) !== oldNameCrc32) {
              // > If the CRC check fails, this UTF-8 Path Extra Field should be
              // > ignored and the File Name field in the header should be used instead.
              continue;
            }
            // UnicodeName   Variable    UTF-8 version of the entry File Name
            entry.fileName = decodeBuffer(extraField.data, 5, extraField.data.length, true);
            break;
          }
        }
      }

      // validate file size
      if (self.validateEntrySizes && entry.compressionMethod === 0) {
        var expectedCompressedSize = entry.uncompressedSize;
        if (entry.isEncrypted()) {
          // traditional encryption prefixes the file data with a header
          expectedCompressedSize += 12;
        }
        if (entry.compressedSize !== expectedCompressedSize) {
          var msg = "compressed/uncompressed size mismatch for stored file: " + entry.compressedSize + " != " + entry.uncompressedSize;
          return emitErrorAndAutoClose(self, new Error(msg));
        }
      }

      if (self.decodeStrings) {
        if (!self.strictFileNames) {
          // allow backslash
          entry.fileName = entry.fileName.replace(/\\/g, "/");
        }
        var errorMessage = validateFileName(entry.fileName, self.validateFileNameOptions);
        if (errorMessage != null) return emitErrorAndAutoClose(self, new Error(errorMessage));
      }
      self.emit("entry", entry);

      if (!self.lazyEntries) self._readEntry();
    });
  });
};

ZipFile.prototype.openReadStream = function(entry, options, callback) {
  var self = this;
  // parameter validation
  var relativeStart = 0;
  var relativeEnd = entry.compressedSize;
  if (callback == null) {
    callback = options;
    options = {};
  } else {
    // validate options that the caller has no excuse to get wrong
    if (options.decrypt != null) {
      if (!entry.isEncrypted()) {
        throw new Error("options.decrypt can only be specified for encrypted entries");
      }
      if (options.decrypt !== false) throw new Error("invalid options.decrypt value: " + options.decrypt);
      if (entry.isCompressed()) {
        if (options.decompress !== false) throw new Error("entry is encrypted and compressed, and options.decompress !== false");
      }
    }
    if (options.decompress != null) {
      if (!entry.isCompressed()) {
        throw new Error("options.decompress can only be specified for compressed entries");
      }
      if (!(options.decompress === false || options.decompress === true)) {
        throw new Error("invalid options.decompress value: " + options.decompress);
      }
    }
    if (options.start != null || options.end != null) {
      if (entry.isCompressed() && options.decompress !== false) {
        throw new Error("start/end range not allowed for compressed entry without options.decompress === false");
      }
      if (entry.isEncrypted() && options.decrypt !== false) {
        throw new Error("start/end range not allowed for encrypted entry without options.decrypt === false");
      }
    }
    if (options.start != null) {
      relativeStart = options.start;
      if (relativeStart < 0) throw new Error("options.start < 0");
      if (relativeStart > entry.compressedSize) throw new Error("options.start > entry.compressedSize");
    }
    if (options.end != null) {
      relativeEnd = options.end;
      if (relativeEnd < 0) throw new Error("options.end < 0");
      if (relativeEnd > entry.compressedSize) throw new Error("options.end > entry.compressedSize");
      if (relativeEnd < relativeStart) throw new Error("options.end < options.start");
    }
  }
  // any further errors can either be caused by the zipfile,
  // or were introduced in a minor version of yauzl,
  // so should be passed to the client rather than thrown.
  if (!self.isOpen) return callback(new Error("closed"));
  if (entry.isEncrypted()) {
    if (options.decrypt !== false) return callback(new Error("entry is encrypted, and options.decrypt !== false"));
  }
  // make sure we don't lose the fd before we open the actual read stream
  self.reader.ref();
  var buffer = newBuffer(30);
  readAndAssertNoEof(self.reader, buffer, 0, buffer.length, entry.relativeOffsetOfLocalHeader, function(err) {
    try {
      if (err) return callback(err);
      // 0 - Local file header signature = 0x04034b50
      var signature = buffer.readUInt32LE(0);
      if (signature !== 0x04034b50) {
        return callback(new Error("invalid local file header signature: 0x" + signature.toString(16)));
      }
      // all this should be redundant
      // 4 - Version needed to extract (minimum)
      // 6 - General purpose bit flag
      // 8 - Compression method
      // 10 - File last modification time
      // 12 - File last modification date
      // 14 - CRC-32
      // 18 - Compressed size
      // 22 - Uncompressed size
      // 26 - File name length (n)
      var fileNameLength = buffer.readUInt16LE(26);
      // 28 - Extra field length (m)
      var extraFieldLength = buffer.readUInt16LE(28);
      // 30 - File name
      // 30+n - Extra field
      var localFileHeaderEnd = entry.relativeOffsetOfLocalHeader + buffer.length + fileNameLength + extraFieldLength;
      var decompress;
      if (entry.compressionMethod === 0) {
        // 0 - The file is stored (no compression)
        decompress = false;
      } else if (entry.compressionMethod === 8) {
        // 8 - The file is Deflated
        decompress = options.decompress != null ? options.decompress : true;
      } else {
        return callback(new Error("unsupported compression method: " + entry.compressionMethod));
      }
      var fileDataStart = localFileHeaderEnd;
      var fileDataEnd = fileDataStart + entry.compressedSize;
      if (entry.compressedSize !== 0) {
        // bounds check now, because the read streams will probably not complain loud enough.
        // since we're dealing with an unsigned offset plus an unsigned size,
        // we only have 1 thing to check for.
        if (fileDataEnd > self.fileSize) {
          return callback(new Error("file data overflows file bounds: " +
              fileDataStart + " + " + entry.compressedSize + " > " + self.fileSize));
        }
      }
      var readStream = self.reader.createReadStream({
        start: fileDataStart + relativeStart,
        end: fileDataStart + relativeEnd,
      });
      var endpointStream = readStream;
      if (decompress) {
        var destroyed = false;
        var inflateFilter = zlib$1.createInflateRaw();
        readStream.on("error", function(err) {
          // setImmediate here because errors can be emitted during the first call to pipe()
          setImmediate(function() {
            if (!destroyed) inflateFilter.emit("error", err);
          });
        });
        readStream.pipe(inflateFilter);

        if (self.validateEntrySizes) {
          endpointStream = new AssertByteCountStream(entry.uncompressedSize);
          inflateFilter.on("error", function(err) {
            // forward zlib errors to the client-visible stream
            setImmediate(function() {
              if (!destroyed) endpointStream.emit("error", err);
            });
          });
          inflateFilter.pipe(endpointStream);
        } else {
          // the zlib filter is the client-visible stream
          endpointStream = inflateFilter;
        }
        // this is part of yauzl's API, so implement this function on the client-visible stream
        endpointStream.destroy = function() {
          destroyed = true;
          if (inflateFilter !== endpointStream) inflateFilter.unpipe(endpointStream);
          readStream.unpipe(inflateFilter);
          // TODO: the inflateFilter may cause a memory leak. see Issue #27.
          readStream.destroy();
        };
      }
      callback(null, endpointStream);
    } finally {
      self.reader.unref();
    }
  });
};

function Entry() {
}
Entry.prototype.getLastModDate = function() {
  return dosDateTimeToDate(this.lastModFileDate, this.lastModFileTime);
};
Entry.prototype.isEncrypted = function() {
  return (this.generalPurposeBitFlag & 0x1) !== 0;
};
Entry.prototype.isCompressed = function() {
  return this.compressionMethod === 8;
};

function dosDateTimeToDate(date, time) {
  var day = date & 0x1f; // 1-31
  var month = (date >> 5 & 0xf) - 1; // 1-12, 0-11
  var year = (date >> 9 & 0x7f) + 1980; // 0-128, 1980-2108

  var millisecond = 0;
  var second = (time & 0x1f) * 2; // 0-29, 0-58 (even numbers)
  var minute = time >> 5 & 0x3f; // 0-59
  var hour = time >> 11 & 0x1f; // 0-23

  return new Date(year, month, day, hour, minute, second, millisecond);
}

function validateFileName(fileName) {
  if (fileName.indexOf("\\") !== -1) {
    return "invalid characters in fileName: " + fileName;
  }
  if (/^[a-zA-Z]:/.test(fileName) || /^\//.test(fileName)) {
    return "absolute path: " + fileName;
  }
  if (fileName.split("/").indexOf("..") !== -1) {
    return "invalid relative path: " + fileName;
  }
  // all good
  return null;
}

function readAndAssertNoEof(reader, buffer, offset, length, position, callback) {
  if (length === 0) {
    // fs.read will throw an out-of-bounds error if you try to read 0 bytes from a 0 byte file
    return setImmediate(function() { callback(null, newBuffer(0)); });
  }
  reader.read(buffer, offset, length, position, function(err, bytesRead) {
    if (err) return callback(err);
    if (bytesRead < length) {
      return callback(new Error("unexpected EOF"));
    }
    callback();
  });
}

util$1.inherits(AssertByteCountStream, Transform$1);
function AssertByteCountStream(byteCount) {
  Transform$1.call(this);
  this.actualByteCount = 0;
  this.expectedByteCount = byteCount;
}
AssertByteCountStream.prototype._transform = function(chunk, encoding, cb) {
  this.actualByteCount += chunk.length;
  if (this.actualByteCount > this.expectedByteCount) {
    var msg = "too many bytes in the stream. expected " + this.expectedByteCount + ". got at least " + this.actualByteCount;
    return cb(new Error(msg));
  }
  cb(null, chunk);
};
AssertByteCountStream.prototype._flush = function(cb) {
  if (this.actualByteCount < this.expectedByteCount) {
    var msg = "not enough bytes in the stream. expected " + this.expectedByteCount + ". got only " + this.actualByteCount;
    return cb(new Error(msg));
  }
  cb();
};

util$1.inherits(RandomAccessReader, EventEmitter$3);
function RandomAccessReader() {
  EventEmitter$3.call(this);
  this.refCount = 0;
}
RandomAccessReader.prototype.ref = function() {
  this.refCount += 1;
};
RandomAccessReader.prototype.unref = function() {
  var self = this;
  self.refCount -= 1;

  if (self.refCount > 0) return;
  if (self.refCount < 0) throw new Error("invalid unref");

  self.close(onCloseDone);

  function onCloseDone(err) {
    if (err) return self.emit('error', err);
    self.emit('close');
  }
};
RandomAccessReader.prototype.createReadStream = function(options) {
  var start = options.start;
  var end = options.end;
  if (start === end) {
    var emptyStream = new PassThrough$4();
    setImmediate(function() {
      emptyStream.end();
    });
    return emptyStream;
  }
  var stream = this._readStreamForRange(start, end);

  var destroyed = false;
  var refUnrefFilter = new RefUnrefFilter(this);
  stream.on("error", function(err) {
    setImmediate(function() {
      if (!destroyed) refUnrefFilter.emit("error", err);
    });
  });
  refUnrefFilter.destroy = function() {
    stream.unpipe(refUnrefFilter);
    refUnrefFilter.unref();
    stream.destroy();
  };

  var byteCounter = new AssertByteCountStream(end - start);
  refUnrefFilter.on("error", function(err) {
    setImmediate(function() {
      if (!destroyed) byteCounter.emit("error", err);
    });
  });
  byteCounter.destroy = function() {
    destroyed = true;
    refUnrefFilter.unpipe(byteCounter);
    refUnrefFilter.destroy();
  };

  return stream.pipe(refUnrefFilter).pipe(byteCounter);
};
RandomAccessReader.prototype._readStreamForRange = function(start, end) {
  throw new Error("not implemented");
};
RandomAccessReader.prototype.read = function(buffer, offset, length, position, callback) {
  var readStream = this.createReadStream({start: position, end: position + length});
  var writeStream = new Writable();
  var written = 0;
  writeStream._write = function(chunk, encoding, cb) {
    chunk.copy(buffer, offset + written, 0, chunk.length);
    written += chunk.length;
    cb();
  };
  writeStream.on("finish", callback);
  readStream.on("error", function(error) {
    callback(error);
  });
  readStream.pipe(writeStream);
};
RandomAccessReader.prototype.close = function(callback) {
  setImmediate(callback);
};

util$1.inherits(RefUnrefFilter, PassThrough$4);
function RefUnrefFilter(context) {
  PassThrough$4.call(this);
  this.context = context;
  this.context.ref();
  this.unreffedYet = false;
}
RefUnrefFilter.prototype._flush = function(cb) {
  this.unref();
  cb();
};
RefUnrefFilter.prototype.unref = function(cb) {
  if (this.unreffedYet) return;
  this.unreffedYet = true;
  this.context.unref();
};

var cp437 = '\u0000☺☻♥♦♣♠•◘○◙♂♀♪♫☼►◄↕‼¶§▬↨↑↓→←∟↔▲▼ !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜ¢£¥₧ƒáíóúñÑªº¿⌐¬½¼¡«»░▒▓│┤╡╢╖╕╣║╗╝╜╛┐└┴┬├─┼╞╟╚╔╩╦╠═╬╧╨╤╥╙╘╒╓╫╪┘┌█▄▌▐▀αßΓπΣσµτΦΘΩδ∞φε∩≡±≥≤⌠⌡÷≈°∙·√ⁿ²■ ';
function decodeBuffer(buffer, start, end, isUtf8) {
  if (isUtf8) {
    return buffer.toString("utf8", start, end);
  } else {
    var result = "";
    for (var i = start; i < end; i++) {
      result += cp437[buffer[i]];
    }
    return result;
  }
}

function readUInt64LE(buffer, offset) {
  // there is no native function for this, because we can't actually store 64-bit integers precisely.
  // after 53 bits, JavaScript's Number type (IEEE 754 double) can't store individual integers anymore.
  // but since 53 bits is a whole lot more than 32 bits, we do our best anyway.
  var lower32 = buffer.readUInt32LE(offset);
  var upper32 = buffer.readUInt32LE(offset + 4);
  // we can't use bitshifting here, because JavaScript bitshifting only works on 32-bit integers.
  return upper32 * 0x100000000 + lower32;
  // as long as we're bounds checking the result of this function against the total file size,
  // we'll catch any overflow errors, because we already made sure the total file size was within reason.
}

// Node 10 deprecated new Buffer().
var newBuffer;
if (typeof Buffer.allocUnsafe === "function") {
  newBuffer = function(len) {
    return Buffer.allocUnsafe(len);
  };
} else {
  newBuffer = function(len) {
    return new Buffer(len);
  };
}

function defaultCallback(err) {
  if (err) throw err;
}

const fileType$2 = fileType$3;
const getStream$5 = getStreamExports$1;
const pify$5 = pifyExports;
const yauzl = yauzl$1;

const getType = (entry, mode) => {
	const IFMT = 61440;
	const IFDIR = 16384;
	const IFLNK = 40960;
	const madeBy = entry.versionMadeBy >> 8;

	if ((mode & IFMT) === IFLNK) {
		return 'symlink';
	}

	if ((mode & IFMT) === IFDIR || (madeBy === 0 && entry.externalFileAttributes === 16)) {
		return 'directory';
	}

	return 'file';
};

const extractEntry = (entry, zip) => {
	const file = {
		mode: (entry.externalFileAttributes >> 16) & 0xFFFF,
		mtime: entry.getLastModDate(),
		path: entry.fileName
	};

	file.type = getType(entry, file.mode);

	if (file.mode === 0 && file.type === 'directory') {
		file.mode = 493;
	}

	if (file.mode === 0) {
		file.mode = 420;
	}

	return pify$5(zip.openReadStream.bind(zip))(entry)
		.then(getStream$5.buffer)
		.then(buf => {
			file.data = buf;

			if (file.type === 'symlink') {
				file.linkname = buf.toString();
			}

			return file;
		})
		.catch(err => {
			zip.close();
			throw err;
		});
};

const extractFile$1 = zip => new Promise((resolve, reject) => {
	const files = [];

	zip.readEntry();

	zip.on('entry', entry => {
		extractEntry(entry, zip)
			.catch(reject)
			.then(file => {
				files.push(file);
				zip.readEntry();
			});
	});

	zip.on('error', reject);
	zip.on('end', () => resolve(files));
});

var decompressUnzip$1 = () => buf => {
	if (!Buffer.isBuffer(buf)) {
		return Promise.reject(new TypeError(`Expected a Buffer, got ${typeof buf}`));
	}

	if (!fileType$2(buf) || fileType$2(buf).ext !== 'zip') {
		return Promise.resolve([]);
	}

	return pify$5(yauzl.fromBuffer)(buf, {lazyEntries: true}).then(extractFile$1);
};

var makeDir$2 = {exports: {}};

const processFn = (fn, opts) => function () {
	const P = opts.promiseModule;
	const args = new Array(arguments.length);

	for (let i = 0; i < arguments.length; i++) {
		args[i] = arguments[i];
	}

	return new P((resolve, reject) => {
		if (opts.errorFirst) {
			args.push(function (err, result) {
				if (opts.multiArgs) {
					const results = new Array(arguments.length - 1);

					for (let i = 1; i < arguments.length; i++) {
						results[i - 1] = arguments[i];
					}

					if (err) {
						results.unshift(err);
						reject(results);
					} else {
						resolve(results);
					}
				} else if (err) {
					reject(err);
				} else {
					resolve(result);
				}
			});
		} else {
			args.push(function (result) {
				if (opts.multiArgs) {
					const results = new Array(arguments.length - 1);

					for (let i = 0; i < arguments.length; i++) {
						results[i] = arguments[i];
					}

					resolve(results);
				} else {
					resolve(result);
				}
			});
		}

		fn.apply(this, args);
	});
};

var pify$4 = (obj, opts) => {
	opts = Object.assign({
		exclude: [/.+(Sync|Stream)$/],
		errorFirst: true,
		promiseModule: Promise
	}, opts);

	const filter = key => {
		const match = pattern => typeof pattern === 'string' ? key === pattern : pattern.test(key);
		return opts.include ? opts.include.some(match) : !opts.exclude.some(match);
	};

	let ret;
	if (typeof obj === 'function') {
		ret = function () {
			if (opts.excludeMain) {
				return obj.apply(this, arguments);
			}

			return processFn(obj, opts).apply(this, arguments);
		};
	} else {
		ret = Object.create(Object.getPrototypeOf(obj));
	}

	for (const key in obj) { // eslint-disable-line guard-for-in
		const x = obj[key];
		ret[key] = typeof x === 'function' && filter(key) ? processFn(x, opts) : x;
	}

	return ret;
};

const fs$4 = require$$0$3;
const path$5 = require$$1$1;
const pify$3 = pify$4;

const defaults$2 = {
	mode: 0o777 & (~process.umask()),
	fs: fs$4
};

// https://github.com/nodejs/node/issues/8987
// https://github.com/libuv/libuv/pull/1088
const checkPath = pth => {
	if (process.platform === 'win32') {
		const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path$5.parse(pth).root, ''));

		if (pathHasInvalidWinCharacters) {
			const err = new Error(`Path contains invalid characters: ${pth}`);
			err.code = 'EINVAL';
			throw err;
		}
	}
};

makeDir$2.exports = (input, opts) => Promise.resolve().then(() => {
	checkPath(input);
	opts = Object.assign({}, defaults$2, opts);

	const mkdir = pify$3(opts.fs.mkdir);
	const stat = pify$3(opts.fs.stat);

	const make = pth => {
		return mkdir(pth, opts.mode)
			.then(() => pth)
			.catch(err => {
				if (err.code === 'ENOENT') {
					if (err.message.includes('null bytes') || path$5.dirname(pth) === pth) {
						throw err;
					}

					return make(path$5.dirname(pth)).then(() => make(pth));
				}

				return stat(pth)
					.then(stats => stats.isDirectory() ? pth : Promise.reject())
					.catch(() => {
						throw err;
					});
			});
	};

	return make(path$5.resolve(input));
});

makeDir$2.exports.sync = (input, opts) => {
	checkPath(input);
	opts = Object.assign({}, defaults$2, opts);

	const make = pth => {
		try {
			opts.fs.mkdirSync(pth, opts.mode);
		} catch (err) {
			if (err.code === 'ENOENT') {
				if (err.message.includes('null bytes') || path$5.dirname(pth) === pth) {
					throw err;
				}

				make(path$5.dirname(pth));
				return make(pth);
			}

			try {
				if (!opts.fs.statSync(pth).isDirectory()) {
					throw new Error('The path is not a directory');
				}
			} catch (_) {
				throw err;
			}
		}

		return pth;
	};

	return make(path$5.resolve(input));
};

var makeDirExports = makeDir$2.exports;

/*!
 * is-natural-number.js | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/is-natural-number.js
*/

var isNaturalNumber$1 = function isNaturalNumber(val, option) {
  if (option) {
    if (typeof option !== 'object') {
      throw new TypeError(
        String(option) +
        ' is not an object. Expected an object that has boolean `includeZero` property.'
      );
    }

    if ('includeZero' in option) {
      if (typeof option.includeZero !== 'boolean') {
        throw new TypeError(
          String(option.includeZero) +
          ' is neither true nor false. `includeZero` option must be a Boolean value.'
        );
      }

      if (option.includeZero && val === 0) {
        return true;
      }
    }
  }

  return Number.isSafeInteger(val) && val >= 1;
};

/*!
 * strip-dirs | MIT (c) Shinnosuke Watanabe
 * https://github.com/shinnn/node-strip-dirs
*/

const path$4 = require$$1$1;
const util = require$$0$8;

const isNaturalNumber = isNaturalNumber$1;

var stripDirs$1 = function stripDirs(pathStr, count, option) {
  if (typeof pathStr !== 'string') {
    throw new TypeError(
      util.inspect(pathStr) +
      ' is not a string. First argument to strip-dirs must be a path string.'
    );
  }

  if (path$4.posix.isAbsolute(pathStr) || path$4.win32.isAbsolute(pathStr)) {
    throw new Error(`${pathStr} is an absolute path. strip-dirs requires a relative path.`);
  }

  if (!isNaturalNumber(count, {includeZero: true})) {
    throw new Error(
      'The Second argument of strip-dirs must be a natural number or 0, but received ' +
      util.inspect(count) +
      '.'
    );
  }

  if (option) {
    if (typeof option !== 'object') {
      throw new TypeError(
        util.inspect(option) +
        ' is not an object. Expected an object with a boolean `disallowOverflow` property.'
      );
    }

    if (Array.isArray(option)) {
      throw new TypeError(
        util.inspect(option) +
        ' is an array. Expected an object with a boolean `disallowOverflow` property.'
      );
    }

    if ('disallowOverflow' in option && typeof option.disallowOverflow !== 'boolean') {
      throw new TypeError(
        util.inspect(option.disallowOverflow) +
        ' is neither true nor false. `disallowOverflow` option must be a Boolean value.'
      );
    }
  } else {
    option = {disallowOverflow: false};
  }

  const pathComponents = path$4.normalize(pathStr).split(path$4.sep);

  if (pathComponents.length > 1 && pathComponents[0] === '.') {
    pathComponents.shift();
  }

  if (count > pathComponents.length - 1) {
    if (option.disallowOverflow) {
      throw new RangeError('Cannot strip more directories than there are.');
    }

    count = pathComponents.length - 1;
  }

  return path$4.join.apply(null, pathComponents.slice(count));
};

const path$3 = require$$1$1;
const fs$3 = gracefulFs;
const decompressTar = decompressTar$3;
const decompressTarbz2 = decompressTarbz2$1;
const decompressTargz = decompressTargz$1;
const decompressUnzip = decompressUnzip$1;
const makeDir$1 = makeDirExports;
const pify$2 = pifyExports;
const stripDirs = stripDirs$1;

const fsP$1 = pify$2(fs$3);

const runPlugins = (input, opts) => {
	if (opts.plugins.length === 0) {
		return Promise.resolve([]);
	}

	return Promise.all(opts.plugins.map(x => x(input, opts))).then(files => files.reduce((a, b) => a.concat(b)));
};

const safeMakeDir = (dir, realOutputPath) => {
	return fsP$1.realpath(dir)
		.catch(_ => {
			const parent = path$3.dirname(dir);
			return safeMakeDir(parent, realOutputPath);
		})
		.then(realParentPath => {
			if (realParentPath.indexOf(realOutputPath) !== 0) {
				throw (new Error('Refusing to create a directory outside the output path.'));
			}

			return makeDir$1(dir).then(fsP$1.realpath);
		});
};

const preventWritingThroughSymlink = (destination, realOutputPath) => {
	return fsP$1.readlink(destination)
		.catch(_ => {
			// Either no file exists, or it's not a symlink. In either case, this is
			// not an escape we need to worry about in this phase.
			return null;
		})
		.then(symlinkPointsTo => {
			if (symlinkPointsTo) {
				throw new Error('Refusing to write into a symlink');
			}

			// No symlink exists at `destination`, so we can continue
			return realOutputPath;
		});
};

const extractFile = (input, output, opts) => runPlugins(input, opts).then(files => {
	if (opts.strip > 0) {
		files = files
			.map(x => {
				x.path = stripDirs(x.path, opts.strip);
				return x;
			})
			.filter(x => x.path !== '.');
	}

	if (typeof opts.filter === 'function') {
		files = files.filter(opts.filter);
	}

	if (typeof opts.map === 'function') {
		files = files.map(opts.map);
	}

	if (!output) {
		return files;
	}

	return Promise.all(files.map(x => {
		const dest = path$3.join(output, x.path);
		const mode = x.mode & ~process.umask();
		const now = new Date();

		if (x.type === 'directory') {
			return makeDir$1(output)
				.then(outputPath => fsP$1.realpath(outputPath))
				.then(realOutputPath => safeMakeDir(dest, realOutputPath))
				.then(() => fsP$1.utimes(dest, now, x.mtime))
				.then(() => x);
		}

		return makeDir$1(output)
			.then(outputPath => fsP$1.realpath(outputPath))
			.then(realOutputPath => {
				// Attempt to ensure parent directory exists (failing if it's outside the output dir)
				return safeMakeDir(path$3.dirname(dest), realOutputPath)
					.then(() => realOutputPath);
			})
			.then(realOutputPath => {
				if (x.type === 'file') {
					return preventWritingThroughSymlink(dest, realOutputPath);
				}

				return realOutputPath;
			})
			.then(realOutputPath => {
				return fsP$1.realpath(path$3.dirname(dest))
					.then(realDestinationDir => {
						if (realDestinationDir.indexOf(realOutputPath) !== 0) {
							throw (new Error('Refusing to write outside output directory: ' + realDestinationDir));
						}
					});
			})
			.then(() => {
				if (x.type === 'link') {
					return fsP$1.link(x.linkname, dest);
				}

				if (x.type === 'symlink' && process.platform === 'win32') {
					return fsP$1.link(x.linkname, dest);
				}

				if (x.type === 'symlink') {
					return fsP$1.symlink(x.linkname, dest);
				}

				return fsP$1.writeFile(dest, x.data, {mode});
			})
			.then(() => x.type === 'file' && fsP$1.utimes(dest, now, x.mtime))
			.then(() => x);
	}));
});

var decompress$1 = (input, output, opts) => {
	if (typeof input !== 'string' && !Buffer.isBuffer(input)) {
		return Promise.reject(new TypeError('Input file required'));
	}

	if (typeof output === 'object') {
		opts = output;
		output = null;
	}

	opts = Object.assign({plugins: [
		decompressTar(),
		decompressTarbz2(),
		decompressTargz(),
		decompressUnzip()
	]}, opts);

	const read = typeof input === 'string' ? fsP$1.readFile(input) : Promise.resolve(input);

	return read.then(buf => extractFile(buf, output, opts));
};

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;

var escapeStringRegexp$2 = function (str) {
	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(matchOperatorsRe, '\\$&');
};

var escapeStringRegexp$1 = escapeStringRegexp$2;

var trimRepeated$1 = function (str, target) {
	if (typeof str !== 'string' || typeof target !== 'string') {
		throw new TypeError('Expected a string');
	}

	return str.replace(new RegExp('(?:' + escapeStringRegexp$1(target) + '){2,}', 'g'), target);
};

var filenameReservedRegex$1 = {exports: {}};

/* eslint-disable no-control-regex */
// TODO: remove parens when Node.js 6 is targeted. Node.js 4 barfs at it.
filenameReservedRegex$1.exports = () => (/[<>:"\/\\|?*\x00-\x1F]/g);
filenameReservedRegex$1.exports.windowsNames = () => (/^(con|prn|aux|nul|com[0-9]|lpt[0-9])$/i);

var filenameReservedRegexExports = filenameReservedRegex$1.exports;

var escapeStringRegexp = escapeStringRegexp$2;

var stripOuter$1 = function (str, sub) {
	if (typeof str !== 'string' || typeof sub !== 'string') {
		throw new TypeError();
	}

	sub = escapeStringRegexp(sub);
	return str.replace(new RegExp('^' + sub + '|' + sub + '$', 'g'), '');
};

const path$2 = require$$1$1;
const trimRepeated = trimRepeated$1;
const filenameReservedRegex = filenameReservedRegexExports;
const stripOuter = stripOuter$1;

// Doesn't make sense to have longer filenames
const MAX_FILENAME_LENGTH = 100;

const reControlChars = /[\u0000-\u001f\u0080-\u009f]/g; // eslint-disable-line no-control-regex
const reRelativePath = /^\.+/;

const fn = (string, options) => {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string');
	}

	options = options || {};

	const replacement = options.replacement === undefined ? '!' : options.replacement;

	if (filenameReservedRegex().test(replacement) && reControlChars.test(replacement)) {
		throw new Error('Replacement string cannot contain reserved filename characters');
	}

	string = string.replace(filenameReservedRegex(), replacement);
	string = string.replace(reControlChars, replacement);
	string = string.replace(reRelativePath, replacement);

	if (replacement.length > 0) {
		string = trimRepeated(string, replacement);
		string = string.length > 1 ? stripOuter(string, replacement) : string;
	}

	string = filenameReservedRegex.windowsNames().test(string) ? string + replacement : string;
	string = string.slice(0, MAX_FILENAME_LENGTH);

	return string;
};

fn.path = (pth, options) => {
	pth = path$2.resolve(pth);
	return path$2.join(path$2.dirname(pth), fn(path$2.basename(pth), options));
};

var filenamify$1 = fn;

var getStream$4 = {exports: {}};

const PassThrough$3 = require$$0$5.PassThrough;

var bufferStream$1 = opts => {
	opts = Object.assign({}, opts);

	const array = opts.array;
	let encoding = opts.encoding;
	const buffer = encoding === 'buffer';
	let objectMode = false;

	if (array) {
		objectMode = !(encoding || buffer);
	} else {
		encoding = encoding || 'utf8';
	}

	if (buffer) {
		encoding = null;
	}

	let len = 0;
	const ret = [];
	const stream = new PassThrough$3({objectMode});

	if (encoding) {
		stream.setEncoding(encoding);
	}

	stream.on('data', chunk => {
		ret.push(chunk);

		if (objectMode) {
			len = ret.length;
		} else {
			len += chunk.length;
		}
	});

	stream.getBufferedValue = () => {
		if (array) {
			return ret;
		}

		return buffer ? Buffer.concat(ret, len) : ret.join('');
	};

	stream.getBufferedLength = () => len;

	return stream;
};

const bufferStream = bufferStream$1;

function getStream$3(inputStream, opts) {
	if (!inputStream) {
		return Promise.reject(new Error('Expected a stream'));
	}

	opts = Object.assign({maxBuffer: Infinity}, opts);

	const maxBuffer = opts.maxBuffer;
	let stream;
	let clean;

	const p = new Promise((resolve, reject) => {
		const error = err => {
			if (err) { // null check
				err.bufferedData = stream.getBufferedValue();
			}

			reject(err);
		};

		stream = bufferStream(opts);
		inputStream.once('error', error);
		inputStream.pipe(stream);

		stream.on('data', () => {
			if (stream.getBufferedLength() > maxBuffer) {
				reject(new Error('maxBuffer exceeded'));
			}
		});
		stream.once('error', error);
		stream.on('end', resolve);

		clean = () => {
			// some streams doesn't implement the `stream.Readable` interface correctly
			if (inputStream.unpipe) {
				inputStream.unpipe(stream);
			}
		};
	});

	p.then(clean, clean);

	return p.then(() => stream.getBufferedValue());
}

getStream$4.exports = getStream$3;
getStream$4.exports.buffer = (stream, opts) => getStream$3(stream, Object.assign({}, opts, {encoding: 'buffer'}));
getStream$4.exports.array = (stream, opts) => getStream$3(stream, Object.assign({}, opts, {array: true}));

var getStreamExports = getStream$4.exports;

var queryString$1 = {};

var strictUriEncode$1 = function (str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};

var token = '%[a-f0-9]{2}';
var singleMatcher = new RegExp('(' + token + ')|([^%]+?)', 'gi');
var multiMatcher = new RegExp('(' + token + ')+', 'gi');

function decodeComponents(components, split) {
	try {
		// Try to decode the entire string first
		return [decodeURIComponent(components.join(''))];
	} catch (err) {
		// Do nothing
	}

	if (components.length === 1) {
		return components;
	}

	split = split || 1;

	// Split the array in 2 parts
	var left = components.slice(0, split);
	var right = components.slice(split);

	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
}

function decode(input) {
	try {
		return decodeURIComponent(input);
	} catch (err) {
		var tokens = input.match(singleMatcher) || [];

		for (var i = 1; i < tokens.length; i++) {
			input = decodeComponents(tokens, i).join('');

			tokens = input.match(singleMatcher) || [];
		}

		return input;
	}
}

function customDecodeURIComponent(input) {
	// Keep track of all the replacements and prefill the map with the `BOM`
	var replaceMap = {
		'%FE%FF': '\uFFFD\uFFFD',
		'%FF%FE': '\uFFFD\uFFFD'
	};

	var match = multiMatcher.exec(input);
	while (match) {
		try {
			// Decode as big chunks as possible
			replaceMap[match[0]] = decodeURIComponent(match[0]);
		} catch (err) {
			var result = decode(match[0]);

			if (result !== match[0]) {
				replaceMap[match[0]] = result;
			}
		}

		match = multiMatcher.exec(input);
	}

	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
	replaceMap['%C2'] = '\uFFFD';

	var entries = Object.keys(replaceMap);

	for (var i = 0; i < entries.length; i++) {
		// Replace all decoded components
		var key = entries[i];
		input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
	}

	return input;
}

var decodeUriComponent = function (encodedURI) {
	if (typeof encodedURI !== 'string') {
		throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
	}

	try {
		encodedURI = encodedURI.replace(/\+/g, ' ');

		// Try the built in decoder first
		return decodeURIComponent(encodedURI);
	} catch (err) {
		// Fallback to a more advanced decoder
		return customDecodeURIComponent(encodedURI);
	}
};

var strictUriEncode = strictUriEncode$1;
var objectAssign = objectAssign$3;
var decodeComponent = decodeUriComponent;

function encoderForArrayFormat(opts) {
	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, index) {
				return value === null ? [
					encode(key, opts),
					'[',
					index,
					']'
				].join('') : [
					encode(key, opts),
					'[',
					encode(index, opts),
					']=',
					encode(value, opts)
				].join('');
			};

		case 'bracket':
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'[]=',
					encode(value, opts)
				].join('');
			};

		default:
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'=',
					encode(value, opts)
				].join('');
			};
	}
}

function parserForArrayFormat(opts) {
	var result;

	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, accumulator) {
				result = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};

		case 'bracket':
			return function (key, value, accumulator) {
				result = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				} else if (accumulator[key] === undefined) {
					accumulator[key] = [value];
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};

		default:
			return function (key, value, accumulator) {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function encode(value, opts) {
	if (opts.encode) {
		return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	} else if (typeof input === 'object') {
		return keysSorter(Object.keys(input)).sort(function (a, b) {
			return Number(a) - Number(b);
		}).map(function (key) {
			return input[key];
		});
	}

	return input;
}

function extract(str) {
	var queryStart = str.indexOf('?');
	if (queryStart === -1) {
		return '';
	}
	return str.slice(queryStart + 1);
}

function parse(str, opts) {
	opts = objectAssign({arrayFormat: 'none'}, opts);

	var formatter = parserForArrayFormat(opts);

	// Create an object with no prototype
	// https://github.com/sindresorhus/query-string/issues/47
	var ret = Object.create(null);

	if (typeof str !== 'string') {
		return ret;
	}

	str = str.trim().replace(/^[?#&]/, '');

	if (!str) {
		return ret;
	}

	str.split('&').forEach(function (param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;

		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeComponent(val);

		formatter(decodeComponent(key), val, ret);
	});

	return Object.keys(ret).sort().reduce(function (result, key) {
		var val = ret[key];
		if (Boolean(val) && typeof val === 'object' && !Array.isArray(val)) {
			// Sort object keys, not values
			result[key] = keysSorter(val);
		} else {
			result[key] = val;
		}

		return result;
	}, Object.create(null));
}

queryString$1.extract = extract;
queryString$1.parse = parse;

queryString$1.stringify = function (obj, opts) {
	var defaults = {
		encode: true,
		strict: true,
		arrayFormat: 'none'
	};

	opts = objectAssign(defaults, opts);

	if (opts.sort === false) {
		opts.sort = function () {};
	}

	var formatter = encoderForArrayFormat(opts);

	return obj ? Object.keys(obj).sort(opts.sort).map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return encode(key, opts);
		}

		if (Array.isArray(val)) {
			var result = [];

			val.slice().forEach(function (val2) {
				if (val2 === undefined) {
					return;
				}

				result.push(formatter(key, val2, result.length));
			});

			return result.join('&');
		}

		return encode(key, opts) + '=' + encode(val, opts);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};

queryString$1.parseUrl = function (str, opts) {
	return {
		url: str.split('?')[0] || '',
		query: parse(extract(str), opts)
	};
};

var prependHttp$2 = (url, opts) => {
	if (typeof url !== 'string') {
		throw new TypeError(`Expected \`url\` to be of type \`string\`, got \`${typeof url}\``);
	}

	url = url.trim();
	opts = Object.assign({https: false}, opts);

	if (/^\.*\/|^(?!localhost)\w+:/.test(url)) {
		return url;
	}

	return url.replace(/^(?!(?:\w+:)?\/\/)/, opts.https ? 'https://' : 'http://');
};

var toString = Object.prototype.toString;

var isPlainObj$2 = function (x) {
	var prototype;
	return toString.call(x) === '[object Object]' && (prototype = Object.getPrototypeOf(x), prototype === null || prototype === Object.getPrototypeOf({}));
};

const isPlainObj$1 = isPlainObj$2;

var sortKeys$3 = (obj, opts) => {
	if (!isPlainObj$1(obj)) {
		throw new TypeError('Expected a plain object');
	}

	opts = opts || {};

	// DEPRECATED
	if (typeof opts === 'function') {
		throw new TypeError('Specify the compare function as an option instead');
	}

	const deep = opts.deep;
	const seenInput = [];
	const seenOutput = [];

	const sortKeys = x => {
		const seenIndex = seenInput.indexOf(x);

		if (seenIndex !== -1) {
			return seenOutput[seenIndex];
		}

		const ret = {};
		const keys = Object.keys(x).sort(opts.compare);

		seenInput.push(x);
		seenOutput.push(ret);

		for (let i = 0; i < keys.length; i++) {
			const key = keys[i];
			const val = x[key];

			if (deep && Array.isArray(val)) {
				const retArr = [];

				for (let j = 0; j < val.length; j++) {
					retArr[j] = isPlainObj$1(val[j]) ? sortKeys(val[j]) : val[j];
				}

				ret[key] = retArr;
				continue;
			}

			ret[key] = deep && isPlainObj$1(val) ? sortKeys(val) : val;
		}

		return ret;
	};

	return sortKeys(obj);
};

const url$2 = require$$0$4;
const punycode = require$$1$5;
const queryString = queryString$1;
const prependHttp$1 = prependHttp$2;
const sortKeys$2 = sortKeys$3;

const DEFAULT_PORTS = {
	'http:': 80,
	'https:': 443,
	'ftp:': 21
};

// Protocols that always contain a `//`` bit
const slashedProtocol = {
	http: true,
	https: true,
	ftp: true,
	gopher: true,
	file: true,
	'http:': true,
	'https:': true,
	'ftp:': true,
	'gopher:': true,
	'file:': true
};

function testParameter(name, filters) {
	return filters.some(filter => filter instanceof RegExp ? filter.test(name) : filter === name);
}

var normalizeUrl$1 = (str, opts) => {
	opts = Object.assign({
		normalizeProtocol: true,
		normalizeHttps: false,
		stripFragment: true,
		stripWWW: true,
		removeQueryParameters: [/^utm_\w+/i],
		removeTrailingSlash: true,
		removeDirectoryIndex: false,
		sortQueryParameters: true
	}, opts);

	if (typeof str !== 'string') {
		throw new TypeError('Expected a string');
	}

	const hasRelativeProtocol = str.startsWith('//');

	// Prepend protocol
	str = prependHttp$1(str.trim()).replace(/^\/\//, 'http://');

	const urlObj = url$2.parse(str);

	if (opts.normalizeHttps && urlObj.protocol === 'https:') {
		urlObj.protocol = 'http:';
	}

	if (!urlObj.hostname && !urlObj.pathname) {
		throw new Error('Invalid URL');
	}

	// Prevent these from being used by `url.format`
	delete urlObj.host;
	delete urlObj.query;

	// Remove fragment
	if (opts.stripFragment) {
		delete urlObj.hash;
	}

	// Remove default port
	const port = DEFAULT_PORTS[urlObj.protocol];
	if (Number(urlObj.port) === port) {
		delete urlObj.port;
	}

	// Remove duplicate slashes
	if (urlObj.pathname) {
		urlObj.pathname = urlObj.pathname.replace(/\/{2,}/g, '/');
	}

	// Decode URI octets
	if (urlObj.pathname) {
		urlObj.pathname = decodeURI(urlObj.pathname);
	}

	// Remove directory index
	if (opts.removeDirectoryIndex === true) {
		opts.removeDirectoryIndex = [/^index\.[a-z]+$/];
	}

	if (Array.isArray(opts.removeDirectoryIndex) && opts.removeDirectoryIndex.length > 0) {
		let pathComponents = urlObj.pathname.split('/');
		const lastComponent = pathComponents[pathComponents.length - 1];

		if (testParameter(lastComponent, opts.removeDirectoryIndex)) {
			pathComponents = pathComponents.slice(0, pathComponents.length - 1);
			urlObj.pathname = pathComponents.slice(1).join('/') + '/';
		}
	}

	// Resolve relative paths, but only for slashed protocols
	if (slashedProtocol[urlObj.protocol]) {
		const domain = urlObj.protocol + '//' + urlObj.hostname;
		const relative = url$2.resolve(domain, urlObj.pathname);
		urlObj.pathname = relative.replace(domain, '');
	}

	if (urlObj.hostname) {
		// IDN to Unicode
		urlObj.hostname = punycode.toUnicode(urlObj.hostname).toLowerCase();

		// Remove trailing dot
		urlObj.hostname = urlObj.hostname.replace(/\.$/, '');

		// Remove `www.`
		if (opts.stripWWW) {
			urlObj.hostname = urlObj.hostname.replace(/^www\./, '');
		}
	}

	// Remove URL with empty query string
	if (urlObj.search === '?') {
		delete urlObj.search;
	}

	const queryParameters = queryString.parse(urlObj.search);

	// Remove query unwanted parameters
	if (Array.isArray(opts.removeQueryParameters)) {
		for (const key in queryParameters) {
			if (testParameter(key, opts.removeQueryParameters)) {
				delete queryParameters[key];
			}
		}
	}

	// Sort query parameters
	if (opts.sortQueryParameters) {
		urlObj.search = queryString.stringify(sortKeys$2(queryParameters));
	}

	// Decode query parameters
	if (urlObj.search !== null) {
		urlObj.search = decodeURIComponent(urlObj.search);
	}

	// Take advantage of many of the Node `url` normalizations
	str = url$2.format(urlObj);

	// Remove ending `/`
	if (opts.removeTrailingSlash || urlObj.pathname === '/') {
		str = str.replace(/\/$/, '');
	}

	// Restore relative protocol, if applicable
	if (hasRelativeProtocol && !opts.normalizeProtocol) {
		str = str.replace(/^http:\/\//, '//');
	}

	return str;
};

// rfc7231 6.1

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var statusCodeCacheableByDefault = [200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501];

// This implementation does not understand partial responses (206)
var understoodStatuses = [200, 203, 204, 300, 301, 302, 303, 307, 308, 404, 405, 410, 414, 501];

var hopByHopHeaders = { 'connection': true, 'keep-alive': true, 'proxy-authenticate': true, 'proxy-authorization': true, 'te': true, 'trailer': true, 'transfer-encoding': true, 'upgrade': true };
var excludedFromRevalidationUpdate = {
    // Since the old body is reused, it doesn't make sense to change properties of the body
    'content-length': true, 'content-encoding': true, 'transfer-encoding': true,
    'content-range': true
};

function parseCacheControl(header) {
    var cc = {};
    if (!header) return cc;

    // TODO: When there is more than one value present for a given directive (e.g., two Expires header fields, multiple Cache-Control: max-age directives),
    // the directive's value is considered invalid. Caches are encouraged to consider responses that have invalid freshness information to be stale
    var parts = header.trim().split(/\s*,\s*/); // TODO: lame parsing
    for (var _iterator = parts, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
        var _ref;

        if (_isArray) {
            if (_i >= _iterator.length) break;
            _ref = _iterator[_i++];
        } else {
            _i = _iterator.next();
            if (_i.done) break;
            _ref = _i.value;
        }

        var part = _ref;

        var _part$split = part.split(/\s*=\s*/, 2),
            k = _part$split[0],
            v = _part$split[1];

        cc[k] = v === undefined ? true : v.replace(/^"|"$/g, ''); // TODO: lame unquoting
    }

    return cc;
}

function formatCacheControl(cc) {
    var parts = [];
    for (var k in cc) {
        var v = cc[k];
        parts.push(v === true ? k : k + '=' + v);
    }
    if (!parts.length) {
        return undefined;
    }
    return parts.join(', ');
}

var node4 = function () {
    function CachePolicy(req, res) {
        var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
            shared = _ref2.shared,
            cacheHeuristic = _ref2.cacheHeuristic,
            immutableMinTimeToLive = _ref2.immutableMinTimeToLive,
            ignoreCargoCult = _ref2.ignoreCargoCult,
            _fromObject = _ref2._fromObject;

        _classCallCheck(this, CachePolicy);

        if (_fromObject) {
            this._fromObject(_fromObject);
            return;
        }

        if (!res || !res.headers) {
            throw Error("Response headers missing");
        }
        this._assertRequestHasHeaders(req);

        this._responseTime = this.now();
        this._isShared = shared !== false;
        this._cacheHeuristic = undefined !== cacheHeuristic ? cacheHeuristic : 0.1; // 10% matches IE
        this._immutableMinTtl = undefined !== immutableMinTimeToLive ? immutableMinTimeToLive : 24 * 3600 * 1000;

        this._status = 'status' in res ? res.status : 200;
        this._resHeaders = res.headers;
        this._rescc = parseCacheControl(res.headers['cache-control']);
        this._method = 'method' in req ? req.method : 'GET';
        this._url = req.url;
        this._host = req.headers.host;
        this._noAuthorization = !req.headers.authorization;
        this._reqHeaders = res.headers.vary ? req.headers : null; // Don't keep all request headers if they won't be used
        this._reqcc = parseCacheControl(req.headers['cache-control']);

        // Assume that if someone uses legacy, non-standard uncecessary options they don't understand caching,
        // so there's no point stricly adhering to the blindly copy&pasted directives.
        if (ignoreCargoCult && "pre-check" in this._rescc && "post-check" in this._rescc) {
            delete this._rescc['pre-check'];
            delete this._rescc['post-check'];
            delete this._rescc['no-cache'];
            delete this._rescc['no-store'];
            delete this._rescc['must-revalidate'];
            this._resHeaders = Object.assign({}, this._resHeaders, { 'cache-control': formatCacheControl(this._rescc) });
            delete this._resHeaders.expires;
            delete this._resHeaders.pragma;
        }

        // When the Cache-Control header field is not present in a request, caches MUST consider the no-cache request pragma-directive
        // as having the same effect as if "Cache-Control: no-cache" were present (see Section 5.2.1).
        if (!res.headers['cache-control'] && /no-cache/.test(res.headers.pragma)) {
            this._rescc['no-cache'] = true;
        }
    }

    CachePolicy.prototype.now = function now() {
        return Date.now();
    };

    CachePolicy.prototype.storable = function storable() {
        // The "no-store" request directive indicates that a cache MUST NOT store any part of either this request or any response to it.
        return !!(!this._reqcc['no-store'] && (
        // A cache MUST NOT store a response to any request, unless:
        // The request method is understood by the cache and defined as being cacheable, and
        'GET' === this._method || 'HEAD' === this._method || 'POST' === this._method && this._hasExplicitExpiration()) &&
        // the response status code is understood by the cache, and
        understoodStatuses.indexOf(this._status) !== -1 &&
        // the "no-store" cache directive does not appear in request or response header fields, and
        !this._rescc['no-store'] && (
        // the "private" response directive does not appear in the response, if the cache is shared, and
        !this._isShared || !this._rescc.private) && (
        // the Authorization header field does not appear in the request, if the cache is shared,
        !this._isShared || this._noAuthorization || this._allowsStoringAuthenticated()) && (
        // the response either:

        // contains an Expires header field, or
        this._resHeaders.expires ||
        // contains a max-age response directive, or
        // contains a s-maxage response directive and the cache is shared, or
        // contains a public response directive.
        this._rescc.public || this._rescc['max-age'] || this._rescc['s-maxage'] ||
        // has a status code that is defined as cacheable by default
        statusCodeCacheableByDefault.indexOf(this._status) !== -1));
    };

    CachePolicy.prototype._hasExplicitExpiration = function _hasExplicitExpiration() {
        // 4.2.1 Calculating Freshness Lifetime
        return this._isShared && this._rescc['s-maxage'] || this._rescc['max-age'] || this._resHeaders.expires;
    };

    CachePolicy.prototype._assertRequestHasHeaders = function _assertRequestHasHeaders(req) {
        if (!req || !req.headers) {
            throw Error("Request headers missing");
        }
    };

    CachePolicy.prototype.satisfiesWithoutRevalidation = function satisfiesWithoutRevalidation(req) {
        this._assertRequestHasHeaders(req);

        // When presented with a request, a cache MUST NOT reuse a stored response, unless:
        // the presented request does not contain the no-cache pragma (Section 5.4), nor the no-cache cache directive,
        // unless the stored response is successfully validated (Section 4.3), and
        var requestCC = parseCacheControl(req.headers['cache-control']);
        if (requestCC['no-cache'] || /no-cache/.test(req.headers.pragma)) {
            return false;
        }

        if (requestCC['max-age'] && this.age() > requestCC['max-age']) {
            return false;
        }

        if (requestCC['min-fresh'] && this.timeToLive() < 1000 * requestCC['min-fresh']) {
            return false;
        }

        // the stored response is either:
        // fresh, or allowed to be served stale
        if (this.stale()) {
            var allowsStale = requestCC['max-stale'] && !this._rescc['must-revalidate'] && (true === requestCC['max-stale'] || requestCC['max-stale'] > this.age() - this.maxAge());
            if (!allowsStale) {
                return false;
            }
        }

        return this._requestMatches(req, false);
    };

    CachePolicy.prototype._requestMatches = function _requestMatches(req, allowHeadMethod) {
        // The presented effective request URI and that of the stored response match, and
        return (!this._url || this._url === req.url) && this._host === req.headers.host && (
        // the request method associated with the stored response allows it to be used for the presented request, and
        !req.method || this._method === req.method || allowHeadMethod && 'HEAD' === req.method) &&
        // selecting header fields nominated by the stored response (if any) match those presented, and
        this._varyMatches(req);
    };

    CachePolicy.prototype._allowsStoringAuthenticated = function _allowsStoringAuthenticated() {
        //  following Cache-Control response directives (Section 5.2.2) have such an effect: must-revalidate, public, and s-maxage.
        return this._rescc['must-revalidate'] || this._rescc.public || this._rescc['s-maxage'];
    };

    CachePolicy.prototype._varyMatches = function _varyMatches(req) {
        if (!this._resHeaders.vary) {
            return true;
        }

        // A Vary header field-value of "*" always fails to match
        if (this._resHeaders.vary === '*') {
            return false;
        }

        var fields = this._resHeaders.vary.trim().toLowerCase().split(/\s*,\s*/);
        for (var _iterator2 = fields, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : _iterator2[Symbol.iterator]();;) {
            var _ref3;

            if (_isArray2) {
                if (_i2 >= _iterator2.length) break;
                _ref3 = _iterator2[_i2++];
            } else {
                _i2 = _iterator2.next();
                if (_i2.done) break;
                _ref3 = _i2.value;
            }

            var name = _ref3;

            if (req.headers[name] !== this._reqHeaders[name]) return false;
        }
        return true;
    };

    CachePolicy.prototype._copyWithoutHopByHopHeaders = function _copyWithoutHopByHopHeaders(inHeaders) {
        var headers = {};
        for (var name in inHeaders) {
            if (hopByHopHeaders[name]) continue;
            headers[name] = inHeaders[name];
        }
        // 9.1.  Connection
        if (inHeaders.connection) {
            var tokens = inHeaders.connection.trim().split(/\s*,\s*/);
            for (var _iterator3 = tokens, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : _iterator3[Symbol.iterator]();;) {
                var _ref4;

                if (_isArray3) {
                    if (_i3 >= _iterator3.length) break;
                    _ref4 = _iterator3[_i3++];
                } else {
                    _i3 = _iterator3.next();
                    if (_i3.done) break;
                    _ref4 = _i3.value;
                }

                var _name = _ref4;

                delete headers[_name];
            }
        }
        if (headers.warning) {
            var warnings = headers.warning.split(/,/).filter(function (warning) {
                return !/^\s*1[0-9][0-9]/.test(warning);
            });
            if (!warnings.length) {
                delete headers.warning;
            } else {
                headers.warning = warnings.join(',').trim();
            }
        }
        return headers;
    };

    CachePolicy.prototype.responseHeaders = function responseHeaders() {
        var headers = this._copyWithoutHopByHopHeaders(this._resHeaders);
        var age = this.age();

        // A cache SHOULD generate 113 warning if it heuristically chose a freshness
        // lifetime greater than 24 hours and the response's age is greater than 24 hours.
        if (age > 3600 * 24 && !this._hasExplicitExpiration() && this.maxAge() > 3600 * 24) {
            headers.warning = (headers.warning ? `${headers.warning}, ` : '') + '113 - "rfc7234 5.5.4"';
        }
        headers.age = `${Math.round(age)}`;
        return headers;
    };

    /**
     * Value of the Date response header or current time if Date was demed invalid
     * @return timestamp
     */


    CachePolicy.prototype.date = function date() {
        var dateValue = Date.parse(this._resHeaders.date);
        var maxClockDrift = 8 * 3600 * 1000;
        if (Number.isNaN(dateValue) || dateValue < this._responseTime - maxClockDrift || dateValue > this._responseTime + maxClockDrift) {
            return this._responseTime;
        }
        return dateValue;
    };

    /**
     * Value of the Age header, in seconds, updated for the current time.
     * May be fractional.
     *
     * @return Number
     */


    CachePolicy.prototype.age = function age() {
        var age = Math.max(0, (this._responseTime - this.date()) / 1000);
        if (this._resHeaders.age) {
            var ageValue = this._ageValue();
            if (ageValue > age) age = ageValue;
        }

        var residentTime = (this.now() - this._responseTime) / 1000;
        return age + residentTime;
    };

    CachePolicy.prototype._ageValue = function _ageValue() {
        var ageValue = parseInt(this._resHeaders.age);
        return isFinite(ageValue) ? ageValue : 0;
    };

    /**
     * Value of applicable max-age (or heuristic equivalent) in seconds. This counts since response's `Date`.
     *
     * For an up-to-date value, see `timeToLive()`.
     *
     * @return Number
     */


    CachePolicy.prototype.maxAge = function maxAge() {
        if (!this.storable() || this._rescc['no-cache']) {
            return 0;
        }

        // Shared responses with cookies are cacheable according to the RFC, but IMHO it'd be unwise to do so by default
        // so this implementation requires explicit opt-in via public header
        if (this._isShared && this._resHeaders['set-cookie'] && !this._rescc.public && !this._rescc.immutable) {
            return 0;
        }

        if (this._resHeaders.vary === '*') {
            return 0;
        }

        if (this._isShared) {
            if (this._rescc['proxy-revalidate']) {
                return 0;
            }
            // if a response includes the s-maxage directive, a shared cache recipient MUST ignore the Expires field.
            if (this._rescc['s-maxage']) {
                return parseInt(this._rescc['s-maxage'], 10);
            }
        }

        // If a response includes a Cache-Control field with the max-age directive, a recipient MUST ignore the Expires field.
        if (this._rescc['max-age']) {
            return parseInt(this._rescc['max-age'], 10);
        }

        var defaultMinTtl = this._rescc.immutable ? this._immutableMinTtl : 0;

        var dateValue = this.date();
        if (this._resHeaders.expires) {
            var expires = Date.parse(this._resHeaders.expires);
            // A cache recipient MUST interpret invalid date formats, especially the value "0", as representing a time in the past (i.e., "already expired").
            if (Number.isNaN(expires) || expires < dateValue) {
                return 0;
            }
            return Math.max(defaultMinTtl, (expires - dateValue) / 1000);
        }

        if (this._resHeaders['last-modified']) {
            var lastModified = Date.parse(this._resHeaders['last-modified']);
            if (isFinite(lastModified) && dateValue > lastModified) {
                return Math.max(defaultMinTtl, (dateValue - lastModified) / 1000 * this._cacheHeuristic);
            }
        }

        return defaultMinTtl;
    };

    CachePolicy.prototype.timeToLive = function timeToLive() {
        return Math.max(0, this.maxAge() - this.age()) * 1000;
    };

    CachePolicy.prototype.stale = function stale() {
        return this.maxAge() <= this.age();
    };

    CachePolicy.fromObject = function fromObject(obj) {
        return new this(undefined, undefined, { _fromObject: obj });
    };

    CachePolicy.prototype._fromObject = function _fromObject(obj) {
        if (this._responseTime) throw Error("Reinitialized");
        if (!obj || obj.v !== 1) throw Error("Invalid serialization");

        this._responseTime = obj.t;
        this._isShared = obj.sh;
        this._cacheHeuristic = obj.ch;
        this._immutableMinTtl = obj.imm !== undefined ? obj.imm : 24 * 3600 * 1000;
        this._status = obj.st;
        this._resHeaders = obj.resh;
        this._rescc = obj.rescc;
        this._method = obj.m;
        this._url = obj.u;
        this._host = obj.h;
        this._noAuthorization = obj.a;
        this._reqHeaders = obj.reqh;
        this._reqcc = obj.reqcc;
    };

    CachePolicy.prototype.toObject = function toObject() {
        return {
            v: 1,
            t: this._responseTime,
            sh: this._isShared,
            ch: this._cacheHeuristic,
            imm: this._immutableMinTtl,
            st: this._status,
            resh: this._resHeaders,
            rescc: this._rescc,
            m: this._method,
            u: this._url,
            h: this._host,
            a: this._noAuthorization,
            reqh: this._reqHeaders,
            reqcc: this._reqcc
        };
    };

    /**
     * Headers for sending to the origin server to revalidate stale response.
     * Allows server to return 304 to allow reuse of the previous response.
     *
     * Hop by hop headers are always stripped.
     * Revalidation headers may be added or removed, depending on request.
     */


    CachePolicy.prototype.revalidationHeaders = function revalidationHeaders(incomingReq) {
        this._assertRequestHasHeaders(incomingReq);
        var headers = this._copyWithoutHopByHopHeaders(incomingReq.headers);

        // This implementation does not understand range requests
        delete headers['if-range'];

        if (!this._requestMatches(incomingReq, true) || !this.storable()) {
            // revalidation allowed via HEAD
            // not for the same resource, or wasn't allowed to be cached anyway
            delete headers['if-none-match'];
            delete headers['if-modified-since'];
            return headers;
        }

        /* MUST send that entity-tag in any cache validation request (using If-Match or If-None-Match) if an entity-tag has been provided by the origin server. */
        if (this._resHeaders.etag) {
            headers['if-none-match'] = headers['if-none-match'] ? `${headers['if-none-match']}, ${this._resHeaders.etag}` : this._resHeaders.etag;
        }

        // Clients MAY issue simple (non-subrange) GET requests with either weak validators or strong validators. Clients MUST NOT use weak validators in other forms of request.
        var forbidsWeakValidators = headers['accept-ranges'] || headers['if-match'] || headers['if-unmodified-since'] || this._method && this._method != 'GET';

        /* SHOULD send the Last-Modified value in non-subrange cache validation requests (using If-Modified-Since) if only a Last-Modified value has been provided by the origin server.
        Note: This implementation does not understand partial responses (206) */
        if (forbidsWeakValidators) {
            delete headers['if-modified-since'];

            if (headers['if-none-match']) {
                var etags = headers['if-none-match'].split(/,/).filter(function (etag) {
                    return !/^\s*W\//.test(etag);
                });
                if (!etags.length) {
                    delete headers['if-none-match'];
                } else {
                    headers['if-none-match'] = etags.join(',').trim();
                }
            }
        } else if (this._resHeaders['last-modified'] && !headers['if-modified-since']) {
            headers['if-modified-since'] = this._resHeaders['last-modified'];
        }

        return headers;
    };

    /**
     * Creates new CachePolicy with information combined from the previews response,
     * and the new revalidation response.
     *
     * Returns {policy, modified} where modified is a boolean indicating
     * whether the response body has been modified, and old cached body can't be used.
     *
     * @return {Object} {policy: CachePolicy, modified: Boolean}
     */


    CachePolicy.prototype.revalidatedPolicy = function revalidatedPolicy(request, response) {
        this._assertRequestHasHeaders(request);
        if (!response || !response.headers) {
            throw Error("Response headers missing");
        }

        // These aren't going to be supported exactly, since one CachePolicy object
        // doesn't know about all the other cached objects.
        var matches = false;
        if (response.status !== undefined && response.status != 304) {
            matches = false;
        } else if (response.headers.etag && !/^\s*W\//.test(response.headers.etag)) {
            // "All of the stored responses with the same strong validator are selected.
            // If none of the stored responses contain the same strong validator,
            // then the cache MUST NOT use the new response to update any stored responses."
            matches = this._resHeaders.etag && this._resHeaders.etag.replace(/^\s*W\//, '') === response.headers.etag;
        } else if (this._resHeaders.etag && response.headers.etag) {
            // "If the new response contains a weak validator and that validator corresponds
            // to one of the cache's stored responses,
            // then the most recent of those matching stored responses is selected for update."
            matches = this._resHeaders.etag.replace(/^\s*W\//, '') === response.headers.etag.replace(/^\s*W\//, '');
        } else if (this._resHeaders['last-modified']) {
            matches = this._resHeaders['last-modified'] === response.headers['last-modified'];
        } else {
            // If the new response does not include any form of validator (such as in the case where
            // a client generates an If-Modified-Since request from a source other than the Last-Modified
            // response header field), and there is only one stored response, and that stored response also
            // lacks a validator, then that stored response is selected for update.
            if (!this._resHeaders.etag && !this._resHeaders['last-modified'] && !response.headers.etag && !response.headers['last-modified']) {
                matches = true;
            }
        }

        if (!matches) {
            return {
                policy: new this.constructor(request, response),
                modified: true
            };
        }

        // use other header fields provided in the 304 (Not Modified) response to replace all instances
        // of the corresponding header fields in the stored response.
        var headers = {};
        for (var k in this._resHeaders) {
            headers[k] = k in response.headers && !excludedFromRevalidationUpdate[k] ? response.headers[k] : this._resHeaders[k];
        }

        var newResponse = Object.assign({}, response, {
            status: this._status,
            method: this._method,
            headers
        });
        return {
            policy: new this.constructor(request, newResponse),
            modified: false
        };
    };

    return CachePolicy;
}();

var lowercaseKeys$4 = function (obj) {
	var ret = {};
	var keys = Object.keys(Object(obj));

	for (var i = 0; i < keys.length; i++) {
		ret[keys[i].toLowerCase()] = obj[keys[i]];
	}

	return ret;
};

const Readable$1 = require$$0$5.Readable;
const lowercaseKeys$3 = lowercaseKeys$4;

let Response$1 = class Response extends Readable$1 {
	constructor(statusCode, headers, body, url) {
		if (typeof statusCode !== 'number') {
			throw new TypeError('Argument `statusCode` should be a number');
		}
		if (typeof headers !== 'object') {
			throw new TypeError('Argument `headers` should be an object');
		}
		if (!(body instanceof Buffer)) {
			throw new TypeError('Argument `body` should be a buffer');
		}
		if (typeof url !== 'string') {
			throw new TypeError('Argument `url` should be a string');
		}

		super();
		this.statusCode = statusCode;
		this.headers = lowercaseKeys$3(headers);
		this.body = body;
		this.url = url;
	}

	_read() {
		this.push(this.body);
		this.push(null);
	}
};

var src$3 = Response$1;

var lowercaseKeys$2 = function (obj) {
	var ret = {};
	var keys = Object.keys(Object(obj));

	for (var i = 0; i < keys.length; i++) {
		ret[keys[i].toLowerCase()] = obj[keys[i]];
	}

	return ret;
};

// We define these manually to ensure they're always copied
// even if they would move up the prototype chain
// https://nodejs.org/api/http.html#http_class_http_incomingmessage
const knownProps = [
	'destroy',
	'setTimeout',
	'socket',
	'headers',
	'trailers',
	'rawHeaders',
	'statusCode',
	'httpVersion',
	'httpVersionMinor',
	'httpVersionMajor',
	'rawTrailers',
	'statusMessage'
];

var mimicResponse$3 = (fromStream, toStream) => {
	const fromProps = new Set(Object.keys(fromStream).concat(knownProps));

	for (const prop of fromProps) {
		// Don't overwrite existing properties
		if (prop in toStream) {
			continue;
		}

		toStream[prop] = typeof fromStream[prop] === 'function' ? fromStream[prop].bind(fromStream) : fromStream[prop];
	}
};

const PassThrough$2 = require$$0$5.PassThrough;
const mimicResponse$2 = mimicResponse$3;

const cloneResponse$1 = response => {
	if (!(response && response.pipe)) {
		throw new TypeError('Parameter `response` must be a response stream.');
	}

	const clone = new PassThrough$2();
	mimicResponse$2(response, clone);

	return response.pipe(clone);
};

var src$2 = cloneResponse$1;

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var jsonBuffer = {};

//TODO: handle reviver/dehydrate function like normal
//and handle indentation, like normal.
//if anyone needs this... please send pull request.

jsonBuffer.stringify = function stringify (o) {
  if('undefined' == typeof o) return o

  if(o && Buffer.isBuffer(o))
    return JSON.stringify(':base64:' + o.toString('base64'))

  if(o && o.toJSON)
    o =  o.toJSON();

  if(o && 'object' === typeof o) {
    var s = '';
    var array = Array.isArray(o);
    s = array ? '[' : '{';
    var first = true;

    for(var k in o) {
      var ignore = 'function' == typeof o[k] || (!array && 'undefined' === typeof o[k]);
      if(Object.hasOwnProperty.call(o, k) && !ignore) {
        if(!first)
          s += ',';
        first = false;
        if (array) {
          if(o[k] == undefined)
            s += 'null';
          else
            s += stringify(o[k]);
        } else if (o[k] !== void(0)) {
          s += stringify(k) + ':' + stringify(o[k]);
        }
      }
    }

    s += array ? ']' : '}';

    return s
  } else if ('string' === typeof o) {
    return JSON.stringify(/^:/.test(o) ? ':' + o : o)
  } else if ('undefined' === typeof o) {
    return 'null';
  } else
    return JSON.stringify(o)
};

jsonBuffer.parse = function (s) {
  return JSON.parse(s, function (key, value) {
    if('string' === typeof value) {
      if(/^:base64:/.test(value))
        return new Buffer(value.substring(8), 'base64')
      else
        return /^:/.test(value) ? value.substring(1) : value 
    }
    return value
  })
};

const EventEmitter$2 = require$$4;
const JSONB = jsonBuffer;

const loadStore = opts => {
	const adapters = {
		redis: '@keyv/redis',
		mongodb: '@keyv/mongo',
		mongo: '@keyv/mongo',
		sqlite: '@keyv/sqlite',
		postgresql: '@keyv/postgres',
		postgres: '@keyv/postgres',
		mysql: '@keyv/mysql'
	};
	if (opts.adapter || opts.uri) {
		const adapter = opts.adapter || /^[^:]*/.exec(opts.uri)[0];
		return new (commonjsRequire(adapters[adapter]))(opts);
	}
	return new Map();
};

let Keyv$1 = class Keyv extends EventEmitter$2 {
	constructor(uri, opts) {
		super();
		this.opts = Object.assign(
			{ namespace: 'keyv' },
			(typeof uri === 'string') ? { uri } : uri,
			opts
		);

		if (!this.opts.store) {
			const adapterOpts = Object.assign({}, this.opts);
			this.opts.store = loadStore(adapterOpts);
		}

		if (typeof this.opts.store.on === 'function') {
			this.opts.store.on('error', err => this.emit('error', err));
		}

		this.opts.store.namespace = this.opts.namespace;
	}

	_getKeyPrefix(key) {
		return `${this.opts.namespace}:${key}`;
	}

	get(key) {
		key = this._getKeyPrefix(key);
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.get(key))
			.then(data => {
				data = (typeof data === 'string') ? JSONB.parse(data) : data;
				if (data === undefined) {
					return undefined;
				}
				if (typeof data.expires === 'number' && Date.now() > data.expires) {
					this.delete(key);
					return undefined;
				}
				return data.value;
			});
	}

	set(key, value, ttl) {
		key = this._getKeyPrefix(key);
		if (typeof ttl === 'undefined') {
			ttl = this.opts.ttl;
		}
		if (ttl === 0) {
			ttl = undefined;
		}
		const store = this.opts.store;

		return Promise.resolve()
			.then(() => {
				const expires = (typeof ttl === 'number') ? (Date.now() + ttl) : null;
				value = { value, expires };
				return store.set(key, JSONB.stringify(value), ttl);
			})
			.then(() => true);
	}

	delete(key) {
		key = this._getKeyPrefix(key);
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.delete(key));
	}

	clear() {
		const store = this.opts.store;
		return Promise.resolve()
			.then(() => store.clear());
	}
};

var src$1 = Keyv$1;

const EventEmitter$1 = require$$4;
const urlLib$2 = require$$0$4;
const normalizeUrl = normalizeUrl$1;
const getStream$2 = getStreamExports;
const CachePolicy = node4;
const Response = src$3;
const lowercaseKeys$1 = lowercaseKeys$2;
const cloneResponse = src$2;
const Keyv = src$1;

let CacheableRequest$1 = class CacheableRequest {
	constructor(request, cacheAdapter) {
		if (typeof request !== 'function') {
			throw new TypeError('Parameter `request` must be a function');
		}

		this.cache = new Keyv({
			uri: typeof cacheAdapter === 'string' && cacheAdapter,
			store: typeof cacheAdapter !== 'string' && cacheAdapter,
			namespace: 'cacheable-request'
		});

		return this.createCacheableRequest(request);
	}

	createCacheableRequest(request) {
		return (opts, cb) => {
			if (typeof opts === 'string') {
				opts = urlLib$2.parse(opts);
			}
			opts = Object.assign({
				headers: {},
				method: 'GET',
				cache: true,
				strictTtl: false,
				automaticFailover: false
			}, opts);
			opts.headers = lowercaseKeys$1(opts.headers);

			const ee = new EventEmitter$1();
			const url = normalizeUrl(urlLib$2.format(opts));
			const key = `${opts.method}:${url}`;
			let revalidate = false;
			let madeRequest = false;

			const makeRequest = opts => {
				madeRequest = true;
				const handler = response => {
					if (revalidate) {
						const revalidatedPolicy = CachePolicy.fromObject(revalidate.cachePolicy).revalidatedPolicy(opts, response);
						if (!revalidatedPolicy.modified) {
							const headers = revalidatedPolicy.policy.responseHeaders();
							response = new Response(response.statusCode, headers, revalidate.body, revalidate.url);
							response.cachePolicy = revalidatedPolicy.policy;
							response.fromCache = true;
						}
					}

					if (!response.fromCache) {
						response.cachePolicy = new CachePolicy(opts, response);
						response.fromCache = false;
					}

					let clonedResponse;
					if (opts.cache && response.cachePolicy.storable()) {
						clonedResponse = cloneResponse(response);
						getStream$2.buffer(response)
							.then(body => {
								const value = {
									cachePolicy: response.cachePolicy.toObject(),
									url: response.url,
									statusCode: response.fromCache ? revalidate.statusCode : response.statusCode,
									body
								};
								const ttl = opts.strictTtl ? response.cachePolicy.timeToLive() : undefined;
								return this.cache.set(key, value, ttl);
							})
							.catch(err => ee.emit('error', new CacheableRequest.CacheError(err)));
					} else if (opts.cache && revalidate) {
						this.cache.delete(key)
							.catch(err => ee.emit('error', new CacheableRequest.CacheError(err)));
					}

					ee.emit('response', clonedResponse || response);
					if (typeof cb === 'function') {
						cb(clonedResponse || response);
					}
				};

				try {
					const req = request(opts, handler);
					ee.emit('request', req);
				} catch (err) {
					ee.emit('error', new CacheableRequest.RequestError(err));
				}
			};

			const get = opts => Promise.resolve()
				.then(() => opts.cache ? this.cache.get(key) : undefined)
				.then(cacheEntry => {
					if (typeof cacheEntry === 'undefined') {
						return makeRequest(opts);
					}

					const policy = CachePolicy.fromObject(cacheEntry.cachePolicy);
					if (policy.satisfiesWithoutRevalidation(opts)) {
						const headers = policy.responseHeaders();
						const response = new Response(cacheEntry.statusCode, headers, cacheEntry.body, cacheEntry.url);
						response.cachePolicy = policy;
						response.fromCache = true;

						ee.emit('response', response);
						if (typeof cb === 'function') {
							cb(response);
						}
					} else {
						revalidate = cacheEntry;
						opts.headers = policy.revalidationHeaders(opts);
						makeRequest(opts);
					}
				});

			this.cache.on('error', err => ee.emit('error', new CacheableRequest.CacheError(err)));

			get(opts).catch(err => {
				if (opts.automaticFailover && !madeRequest) {
					makeRequest(opts);
				}
				ee.emit('error', new CacheableRequest.CacheError(err));
			});

			return ee;
		};
	}
};

CacheableRequest$1.RequestError = class extends Error {
	constructor(err) {
		super(err.message);
		this.name = 'RequestError';
		Object.assign(this, err);
	}
};

CacheableRequest$1.CacheError = class extends Error {
	constructor(err) {
		super(err.message);
		this.name = 'CacheError';
		Object.assign(this, err);
	}
};

var src = CacheableRequest$1;

var duplexer3$1 = {exports: {}};

var stream = require$$0$5;

function DuplexWrapper(options, writable, readable) {
  if (typeof readable === "undefined") {
    readable = writable;
    writable = options;
    options = null;
  }

  stream.Duplex.call(this, options);

  if (typeof readable.read !== "function") {
    readable = (new stream.Readable(options)).wrap(readable);
  }

  this._writable = writable;
  this._readable = readable;
  this._waiting = false;

  var self = this;

  writable.once("finish", function() {
    self.end();
  });

  this.once("finish", function() {
    writable.end();
  });

  readable.on("readable", function() {
    if (self._waiting) {
      self._waiting = false;
      self._read();
    }
  });

  readable.once("end", function() {
    self.push(null);
  });

  if (!options || typeof options.bubbleErrors === "undefined" || options.bubbleErrors) {
    writable.on("error", function(err) {
      self.emit("error", err);
    });

    readable.on("error", function(err) {
      self.emit("error", err);
    });
  }
}

DuplexWrapper.prototype = Object.create(stream.Duplex.prototype, {constructor: {value: DuplexWrapper}});

DuplexWrapper.prototype._write = function _write(input, encoding, done) {
  this._writable.write(input, encoding, done);
};

DuplexWrapper.prototype._read = function _read() {
  var buf;
  var reads = 0;
  while ((buf = this._readable.read()) !== null) {
    this.push(buf);
    reads++;
  }
  if (reads === 0) {
    this._waiting = true;
  }
};

duplexer3$1.exports = function duplex2(options, writable, readable) {
  return new DuplexWrapper(options, writable, readable);
};

duplexer3$1.exports.DuplexWrapper = DuplexWrapper;

var duplexer3Exports = duplexer3$1.exports;

var intoStream$1 = {exports: {}};

var Readable = readableExports.Readable;
var inherits = requireInherits();

var from2_1 = from2;

from2.ctor = ctor;
from2.obj = obj;

var Proto = ctor();

function toFunction(list) {
  list = list.slice();
  return function (_, cb) {
    var err = null;
    var item = list.length ? list.shift() : null;
    if (item instanceof Error) {
      err = item;
      item = null;
    }

    cb(err, item);
  }
}

function from2(opts, read) {
  if (typeof opts !== 'object' || Array.isArray(opts)) {
    read = opts;
    opts = {};
  }

  var rs = new Proto(opts);
  rs._from = Array.isArray(read) ? toFunction(read) : (read || noop);
  return rs
}

function ctor(opts, read) {
  if (typeof opts === 'function') {
    read = opts;
    opts = {};
  }

  opts = defaults$1(opts);

  inherits(Class, Readable);
  function Class(override) {
    if (!(this instanceof Class)) return new Class(override)
    this._reading = false;
    this._callback = check;
    this.destroyed = false;
    Readable.call(this, override || opts);

    var self = this;
    var hwm = this._readableState.highWaterMark;

    function check(err, data) {
      if (self.destroyed) return
      if (err) return self.destroy(err)
      if (data === null) return self.push(null)
      self._reading = false;
      if (self.push(data)) self._read(hwm);
    }
  }

  Class.prototype._from = read || noop;
  Class.prototype._read = function(size) {
    if (this._reading || this.destroyed) return
    this._reading = true;
    this._from(size, this._callback);
  };

  Class.prototype.destroy = function(err) {
    if (this.destroyed) return
    this.destroyed = true;

    var self = this;
    process.nextTick(function() {
      if (err) self.emit('error', err);
      self.emit('close');
    });
  };

  return Class
}

function obj(opts, read) {
  if (typeof opts === 'function' || Array.isArray(opts)) {
    read = opts;
    opts = {};
  }

  opts = defaults$1(opts);
  opts.objectMode = true;
  opts.highWaterMark = 16;

  return from2(opts, read)
}

function noop () {}

function defaults$1(opts) {
  opts = opts || {};
  return opts
}

var pIsPromise$1 = x => (
	x instanceof Promise ||
	(
		x !== null &&
		typeof x === 'object' &&
		typeof x.then === 'function' &&
		typeof x.catch === 'function'
	)
);

const from = from2_1;
const pIsPromise = pIsPromise$1;

intoStream$1.exports = x => {
	if (Array.isArray(x)) {
		x = x.slice();
	}

	let promise;
	let iterator;

	prepare(x);

	function prepare(value) {
		x = value;
		promise = pIsPromise(x) ? x : null;
		// we don't iterate on strings and buffers since slicing them is ~7x faster
		const shouldIterate = !promise && x[Symbol.iterator] && typeof x !== 'string' && !Buffer.isBuffer(x);
		iterator = shouldIterate ? x[Symbol.iterator]() : null;
	}

	return from(function reader(size, cb) {
		if (promise) {
			promise.then(prepare).then(() => reader.call(this, size, cb), cb);
			return;
		}

		if (iterator) {
			const obj = iterator.next();
			setImmediate(cb, null, obj.done ? null : obj.value);
			return;
		}

		if (x.length === 0) {
			setImmediate(cb, null, null);
			return;
		}

		const chunk = x.slice(0, size);
		x = x.slice(size);

		setImmediate(cb, null, chunk);
	});
};

intoStream$1.exports.obj = x => {
	if (Array.isArray(x)) {
		x = x.slice();
	}

	let promise;
	let iterator;

	prepare(x);

	function prepare(value) {
		x = value;
		promise = pIsPromise(x) ? x : null;
		iterator = !promise && x[Symbol.iterator] ? x[Symbol.iterator]() : null;
	}

	return from.obj(function reader(size, cb) {
		if (promise) {
			promise.then(prepare).then(() => reader.call(this, size, cb), cb);
			return;
		}

		if (iterator) {
			const obj = iterator.next();
			setImmediate(cb, null, obj.done ? null : obj.value);
			return;
		}

		this.push(x);

		setImmediate(cb, null, null);
	});
};

var intoStreamExports = intoStream$1.exports;

var dist = {exports: {}};

(function (module, exports) {
	Object.defineProperty(exports, "__esModule", { value: true });
	const util = require$$0$8;
	const toString = Object.prototype.toString;
	const isOfType = (type) => (value) => typeof value === type; // tslint:disable-line:strict-type-predicates
	const getObjectType = (value) => {
	    const objectName = toString.call(value).slice(8, -1);
	    if (objectName) {
	        return objectName;
	    }
	    return null;
	};
	const isObjectOfType = (typeName) => (value) => {
	    return getObjectType(value) === typeName;
	};
	function is(value) {
	    if (value === null) {
	        return "null" /* null */;
	    }
	    if (value === true || value === false) {
	        return "boolean" /* boolean */;
	    }
	    const type = typeof value;
	    if (type === 'undefined') {
	        return "undefined" /* undefined */;
	    }
	    if (type === 'string') {
	        return "string" /* string */;
	    }
	    if (type === 'number') {
	        return "number" /* number */;
	    }
	    if (type === 'symbol') {
	        return "symbol" /* symbol */;
	    }
	    if (is.function_(value)) {
	        return "Function" /* Function */;
	    }
	    if (Array.isArray(value)) {
	        return "Array" /* Array */;
	    }
	    if (Buffer.isBuffer(value)) {
	        return "Buffer" /* Buffer */;
	    }
	    const tagType = getObjectType(value);
	    if (tagType) {
	        return tagType;
	    }
	    if (value instanceof String || value instanceof Boolean || value instanceof Number) {
	        throw new TypeError('Please don\'t use object wrappers for primitive types');
	    }
	    return "Object" /* Object */;
	}
	(function (is) {
	    const isObject = (value) => typeof value === 'object';
	    // tslint:disable:variable-name
	    is.undefined = isOfType('undefined');
	    is.string = isOfType('string');
	    is.number = isOfType('number');
	    is.function_ = isOfType('function');
	    is.null_ = (value) => value === null;
	    is.class_ = (value) => is.function_(value) && value.toString().startsWith('class ');
	    is.boolean = (value) => value === true || value === false;
	    // tslint:enable:variable-name
	    is.symbol = isOfType('symbol');
	    is.array = Array.isArray;
	    is.buffer = Buffer.isBuffer;
	    is.nullOrUndefined = (value) => is.null_(value) || is.undefined(value);
	    is.object = (value) => !is.nullOrUndefined(value) && (is.function_(value) || isObject(value));
	    is.iterable = (value) => !is.nullOrUndefined(value) && is.function_(value[Symbol.iterator]);
	    is.generator = (value) => is.iterable(value) && is.function_(value.next) && is.function_(value.throw);
	    is.nativePromise = isObjectOfType("Promise" /* Promise */);
	    const hasPromiseAPI = (value) => !is.null_(value) &&
	        isObject(value) &&
	        is.function_(value.then) &&
	        is.function_(value.catch);
	    is.promise = (value) => is.nativePromise(value) || hasPromiseAPI(value);
	    // TODO: Change to use `isObjectOfType` once Node.js 6 or higher is targeted
	    const isFunctionOfType = (type) => (value) => is.function_(value) && is.function_(value.constructor) && value.constructor.name === type;
	    is.generatorFunction = isFunctionOfType('GeneratorFunction');
	    is.asyncFunction = isFunctionOfType('AsyncFunction');
	    is.boundFunction = (value) => is.function_(value) && !value.hasOwnProperty('prototype');
	    is.regExp = isObjectOfType("RegExp" /* RegExp */);
	    is.date = isObjectOfType("Date" /* Date */);
	    is.error = isObjectOfType("Error" /* Error */);
	    is.map = isObjectOfType("Map" /* Map */);
	    is.set = isObjectOfType("Set" /* Set */);
	    is.weakMap = isObjectOfType("WeakMap" /* WeakMap */);
	    is.weakSet = isObjectOfType("WeakSet" /* WeakSet */);
	    is.int8Array = isObjectOfType("Int8Array" /* Int8Array */);
	    is.uint8Array = isObjectOfType("Uint8Array" /* Uint8Array */);
	    is.uint8ClampedArray = isObjectOfType("Uint8ClampedArray" /* Uint8ClampedArray */);
	    is.int16Array = isObjectOfType("Int16Array" /* Int16Array */);
	    is.uint16Array = isObjectOfType("Uint16Array" /* Uint16Array */);
	    is.int32Array = isObjectOfType("Int32Array" /* Int32Array */);
	    is.uint32Array = isObjectOfType("Uint32Array" /* Uint32Array */);
	    is.float32Array = isObjectOfType("Float32Array" /* Float32Array */);
	    is.float64Array = isObjectOfType("Float64Array" /* Float64Array */);
	    is.arrayBuffer = isObjectOfType("ArrayBuffer" /* ArrayBuffer */);
	    is.sharedArrayBuffer = isObjectOfType("SharedArrayBuffer" /* SharedArrayBuffer */);
	    is.dataView = isObjectOfType("DataView" /* DataView */);
	    // TODO: Remove `object` checks when targeting ES2015 or higher
	    // See `Notes`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/getPrototypeOf
	    is.directInstanceOf = (instance, klass) => is.object(instance) && is.object(klass) && Object.getPrototypeOf(instance) === klass.prototype;
	    is.truthy = (value) => Boolean(value);
	    is.falsy = (value) => !value;
	    is.nan = (value) => Number.isNaN(value);
	    const primitiveTypes = new Set([
	        'undefined',
	        'string',
	        'number',
	        'boolean',
	        'symbol'
	    ]);
	    is.primitive = (value) => is.null_(value) || primitiveTypes.has(typeof value);
	    is.integer = (value) => Number.isInteger(value);
	    is.safeInteger = (value) => Number.isSafeInteger(value);
	    is.plainObject = (value) => {
	        // From: https://github.com/sindresorhus/is-plain-obj/blob/master/index.js
	        let prototype;
	        return getObjectType(value) === "Object" /* Object */ &&
	            (prototype = Object.getPrototypeOf(value), prototype === null || // tslint:disable-line:ban-comma-operator
	                prototype === Object.getPrototypeOf({}));
	    };
	    const typedArrayTypes = new Set([
	        "Int8Array" /* Int8Array */,
	        "Uint8Array" /* Uint8Array */,
	        "Uint8ClampedArray" /* Uint8ClampedArray */,
	        "Int16Array" /* Int16Array */,
	        "Uint16Array" /* Uint16Array */,
	        "Int32Array" /* Int32Array */,
	        "Uint32Array" /* Uint32Array */,
	        "Float32Array" /* Float32Array */,
	        "Float64Array" /* Float64Array */
	    ]);
	    is.typedArray = (value) => {
	        const objectType = getObjectType(value);
	        if (objectType === null) {
	            return false;
	        }
	        return typedArrayTypes.has(objectType);
	    };
	    const isValidLength = (value) => is.safeInteger(value) && value > -1;
	    is.arrayLike = (value) => !is.nullOrUndefined(value) && !is.function_(value) && isValidLength(value.length);
	    is.inRange = (value, range) => {
	        if (is.number(range)) {
	            return value >= Math.min(0, range) && value <= Math.max(range, 0);
	        }
	        if (is.array(range) && range.length === 2) {
	            // TODO: Use spread operator here when targeting Node.js 6 or higher
	            return value >= Math.min.apply(null, range) && value <= Math.max.apply(null, range);
	        }
	        throw new TypeError(`Invalid range: ${util.inspect(range)}`);
	    };
	    const NODE_TYPE_ELEMENT = 1;
	    const DOM_PROPERTIES_TO_CHECK = [
	        'innerHTML',
	        'ownerDocument',
	        'style',
	        'attributes',
	        'nodeValue'
	    ];
	    is.domElement = (value) => is.object(value) && value.nodeType === NODE_TYPE_ELEMENT && is.string(value.nodeName) &&
	        !is.plainObject(value) && DOM_PROPERTIES_TO_CHECK.every(property => property in value);
	    is.nodeStream = (value) => !is.nullOrUndefined(value) && isObject(value) && is.function_(value.pipe);
	    is.infinite = (value) => value === Infinity || value === -Infinity;
	    const isAbsoluteMod2 = (value) => (rem) => is.integer(rem) && Math.abs(rem % 2) === value;
	    is.even = isAbsoluteMod2(0);
	    is.odd = isAbsoluteMod2(1);
	    const isWhiteSpaceString = (value) => is.string(value) && /\S/.test(value) === false;
	    const isEmptyStringOrArray = (value) => (is.string(value) || is.array(value)) && value.length === 0;
	    const isEmptyObject = (value) => !is.map(value) && !is.set(value) && is.object(value) && Object.keys(value).length === 0;
	    const isEmptyMapOrSet = (value) => (is.map(value) || is.set(value)) && value.size === 0;
	    is.empty = (value) => is.falsy(value) || isEmptyStringOrArray(value) || isEmptyObject(value) || isEmptyMapOrSet(value);
	    is.emptyOrWhitespace = (value) => is.empty(value) || isWhiteSpaceString(value);
	    const predicateOnArray = (method, predicate, args) => {
	        // `args` is the calling function's "arguments object".
	        // We have to do it this way to keep node v4 support.
	        // So here we convert it to an array and slice off the first item.
	        const values = Array.prototype.slice.call(args, 1);
	        if (is.function_(predicate) === false) {
	            throw new TypeError(`Invalid predicate: ${util.inspect(predicate)}`);
	        }
	        if (values.length === 0) {
	            throw new TypeError('Invalid number of values');
	        }
	        return method.call(values, predicate);
	    };
	    function any(predicate) {
	        return predicateOnArray(Array.prototype.some, predicate, arguments);
	    }
	    is.any = any;
	    function all(predicate) {
	        return predicateOnArray(Array.prototype.every, predicate, arguments);
	    }
	    is.all = all;
	    // tslint:enable:only-arrow-functions no-function-expression
	})(is || (is = {}));
	// Some few keywords are reserved, but we'll populate them for Node.js users
	// See https://github.com/Microsoft/TypeScript/issues/2536
	Object.defineProperties(is, {
	    class: {
	        value: is.class_
	    },
	    function: {
	        value: is.function_
	    },
	    null: {
	        value: is.null_
	    }
	});
	exports.default = is;
	// For CommonJS default export support
	module.exports = is;
	module.exports.default = is; 
} (dist, dist.exports));

var distExports = dist.exports;

var timedOut$1 = function (req, time) {
	if (req.timeoutTimer) {
		return req;
	}

	var delays = isNaN(time) ? time : {socket: time, connect: time};
	var host = req._headers ? (' to ' + req._headers.host) : '';

	if (delays.connect !== undefined) {
		req.timeoutTimer = setTimeout(function timeoutHandler() {
			req.abort();
			var e = new Error('Connection timed out on request' + host);
			e.code = 'ETIMEDOUT';
			req.emit('error', e);
		}, delays.connect);
	}

	// Clear the connection timeout timer once a socket is assigned to the
	// request and is connected.
	req.on('socket', function assign(socket) {
		// Socket may come from Agent pool and may be already connected.
		if (!(socket.connecting || socket._connecting)) {
			connect();
			return;
		}

		socket.once('connect', connect);
	});

	function clear() {
		if (req.timeoutTimer) {
			clearTimeout(req.timeoutTimer);
			req.timeoutTimer = null;
		}
	}

	function connect() {
		clear();

		if (delays.socket !== undefined) {
			// Abort the request if there is no activity on the socket for more
			// than `delays.socket` milliseconds.
			req.setTimeout(delays.socket, function socketTimeoutHandler() {
				req.abort();
				var e = new Error('Socket timed out on request' + host);
				e.code = 'ESOCKETTIMEDOUT';
				req.emit('error', e);
			});
		}
	}

	return req.on('error', clear);
};

const url$1 = require$$0$4;
const prependHttp = prependHttp$2;

var urlParseLax$1 = (input, options) => {
	if (typeof input !== 'string') {
		throw new TypeError(`Expected \`url\` to be of type \`string\`, got \`${typeof input}\` instead.`);
	}

	const finalUrl = prependHttp(input, Object.assign({https: true}, options));
	return url$1.parse(finalUrl);
};

const PassThrough$1 = require$$0$5.PassThrough;
const zlib = require$$1$4;
const mimicResponse$1 = mimicResponse$3;

var decompressResponse$1 = response => {
	// TODO: Use Array#includes when targeting Node.js 6
	if (['gzip', 'deflate'].indexOf(response.headers['content-encoding']) === -1) {
		return response;
	}

	const unzip = zlib.createUnzip();
	const stream = new PassThrough$1();

	mimicResponse$1(response, stream);

	unzip.on('error', err => {
		if (err.code === 'Z_BUF_ERROR') {
			stream.end();
			return;
		}

		stream.emit('error', err);
	});

	response.pipe(unzip).pipe(stream);

	return stream;
};

var WHITELIST = [
	'ETIMEDOUT',
	'ECONNRESET',
	'EADDRINUSE',
	'ESOCKETTIMEDOUT',
	'ECONNREFUSED',
	'EPIPE',
	'EHOSTUNREACH',
	'EAI_AGAIN'
];

var BLACKLIST = [
	'ENOTFOUND',
	'ENETUNREACH',

	// SSL errors from https://github.com/nodejs/node/blob/ed3d8b13ee9a705d89f9e0397d9e96519e7e47ac/src/node_crypto.cc#L1950
	'UNABLE_TO_GET_ISSUER_CERT',
	'UNABLE_TO_GET_CRL',
	'UNABLE_TO_DECRYPT_CERT_SIGNATURE',
	'UNABLE_TO_DECRYPT_CRL_SIGNATURE',
	'UNABLE_TO_DECODE_ISSUER_PUBLIC_KEY',
	'CERT_SIGNATURE_FAILURE',
	'CRL_SIGNATURE_FAILURE',
	'CERT_NOT_YET_VALID',
	'CERT_HAS_EXPIRED',
	'CRL_NOT_YET_VALID',
	'CRL_HAS_EXPIRED',
	'ERROR_IN_CERT_NOT_BEFORE_FIELD',
	'ERROR_IN_CERT_NOT_AFTER_FIELD',
	'ERROR_IN_CRL_LAST_UPDATE_FIELD',
	'ERROR_IN_CRL_NEXT_UPDATE_FIELD',
	'OUT_OF_MEM',
	'DEPTH_ZERO_SELF_SIGNED_CERT',
	'SELF_SIGNED_CERT_IN_CHAIN',
	'UNABLE_TO_GET_ISSUER_CERT_LOCALLY',
	'UNABLE_TO_VERIFY_LEAF_SIGNATURE',
	'CERT_CHAIN_TOO_LONG',
	'CERT_REVOKED',
	'INVALID_CA',
	'PATH_LENGTH_EXCEEDED',
	'INVALID_PURPOSE',
	'CERT_UNTRUSTED',
	'CERT_REJECTED'
];

var isRetryAllowed$1 = function (err) {
	if (!err || !err.code) {
		return true;
	}

	if (WHITELIST.indexOf(err.code) !== -1) {
		return true;
	}

	if (BLACKLIST.indexOf(err.code) !== -1) {
		return false;
	}

	return true;
};

var pCancelable = {exports: {}};

class CancelError extends Error {
	constructor() {
		super('Promise was canceled');
		this.name = 'CancelError';
	}

	get isCanceled() {
		return true;
	}
}

let PCancelable$2 = class PCancelable {
	static fn(userFn) {
		return function () {
			const args = [].slice.apply(arguments);
			return new PCancelable((resolve, reject, onCancel) => {
				args.push(onCancel);
				userFn.apply(null, args).then(resolve, reject);
			});
		};
	}

	constructor(executor) {
		this._cancelHandlers = [];
		this._isPending = true;
		this._isCanceled = false;

		this._promise = new Promise((resolve, reject) => {
			this._reject = reject;

			return executor(
				value => {
					this._isPending = false;
					resolve(value);
				},
				error => {
					this._isPending = false;
					reject(error);
				},
				handler => {
					this._cancelHandlers.push(handler);
				}
			);
		});
	}

	then(onFulfilled, onRejected) {
		return this._promise.then(onFulfilled, onRejected);
	}

	catch(onRejected) {
		return this._promise.catch(onRejected);
	}

	finally(onFinally) {
		return this._promise.finally(onFinally);
	}

	cancel() {
		if (!this._isPending || this._isCanceled) {
			return;
		}

		if (this._cancelHandlers.length > 0) {
			try {
				for (const handler of this._cancelHandlers) {
					handler();
				}
			} catch (err) {
				this._reject(err);
			}
		}

		this._isCanceled = true;
		this._reject(new CancelError());
	}

	get isCanceled() {
		return this._isCanceled;
	}
};

Object.setPrototypeOf(PCancelable$2.prototype, Promise.prototype);

pCancelable.exports = PCancelable$2;
pCancelable.exports.CancelError = CancelError;

var pCancelableExports = pCancelable.exports;

var pTimeout$2 = {exports: {}};

var pFinally$1 = (promise, onFinally) => {
	onFinally = onFinally || (() => {});

	return promise.then(
		val => new Promise(resolve => {
			resolve(onFinally());
		}).then(() => val),
		err => new Promise(resolve => {
			resolve(onFinally());
		}).then(() => {
			throw err;
		})
	);
};

const pFinally = pFinally$1;

class TimeoutError extends Error {
	constructor(message) {
		super(message);
		this.name = 'TimeoutError';
	}
}

pTimeout$2.exports = (promise, ms, fallback) => new Promise((resolve, reject) => {
	if (typeof ms !== 'number' || ms < 0) {
		throw new TypeError('Expected `ms` to be a positive number');
	}

	const timer = setTimeout(() => {
		if (typeof fallback === 'function') {
			try {
				resolve(fallback());
			} catch (err) {
				reject(err);
			}
			return;
		}

		const message = typeof fallback === 'string' ? fallback : `Promise timed out after ${ms} milliseconds`;
		const err = fallback instanceof Error ? fallback : new TimeoutError(message);

		if (typeof promise.cancel === 'function') {
			promise.cancel();
		}

		reject(err);
	}, ms);

	pFinally(
		promise.then(resolve, reject),
		() => {
			clearTimeout(timer);
		}
	);
});

pTimeout$2.exports.TimeoutError = TimeoutError;

var pTimeoutExports = pTimeout$2.exports;

var name = "got";
var version = "8.3.2";
var description = "Simplified HTTP requests";
var license = "MIT";
var repository = "sindresorhus/got";
var maintainers = [
	{
		name: "Sindre Sorhus",
		email: "sindresorhus@gmail.com",
		url: "sindresorhus.com"
	},
	{
		name: "Vsevolod Strukchinsky",
		email: "floatdrop@gmail.com",
		url: "github.com/floatdrop"
	},
	{
		name: "Alexander Tesfamichael",
		email: "alex.tesfamichael@gmail.com",
		url: "alextes.me"
	}
];
var engines = {
	node: ">=4"
};
var scripts = {
	test: "xo && nyc ava",
	coveralls: "nyc report --reporter=text-lcov | coveralls"
};
var files = [
	"index.js",
	"errors.js"
];
var keywords = [
	"http",
	"https",
	"get",
	"got",
	"url",
	"uri",
	"request",
	"util",
	"utility",
	"simple",
	"curl",
	"wget",
	"fetch",
	"net",
	"network",
	"electron"
];
var dependencies = {
	"@sindresorhus/is": "^0.7.0",
	"cacheable-request": "^2.1.1",
	"decompress-response": "^3.3.0",
	duplexer3: "^0.1.4",
	"get-stream": "^3.0.0",
	"into-stream": "^3.1.0",
	"is-retry-allowed": "^1.1.0",
	isurl: "^1.0.0-alpha5",
	"lowercase-keys": "^1.0.0",
	"mimic-response": "^1.0.0",
	"p-cancelable": "^0.4.0",
	"p-timeout": "^2.0.1",
	pify: "^3.0.0",
	"safe-buffer": "^5.1.1",
	"timed-out": "^4.0.1",
	"url-parse-lax": "^3.0.0",
	"url-to-options": "^1.0.1"
};
var devDependencies = {
	ava: "^0.25.0",
	coveralls: "^3.0.0",
	"form-data": "^2.1.1",
	"get-port": "^3.0.0",
	nyc: "^11.0.2",
	"p-event": "^1.3.0",
	pem: "^1.4.4",
	proxyquire: "^1.8.0",
	sinon: "^4.0.0",
	"slow-stream": "0.0.4",
	tempfile: "^2.0.0",
	tempy: "^0.2.1",
	"universal-url": "1.0.0-alpha",
	xo: "^0.20.0"
};
var ava = {
	concurrency: 4
};
var browser = {
	"decompress-response": false,
	electron: false
};
var require$$24 = {
	name: name,
	version: version,
	description: description,
	license: license,
	repository: repository,
	maintainers: maintainers,
	engines: engines,
	scripts: scripts,
	files: files,
	keywords: keywords,
	dependencies: dependencies,
	devDependencies: devDependencies,
	ava: ava,
	browser: browser
};

var errors$1 = {};

const urlLib$1 = require$$0$4;
const http$1 = require$$1$2;
const PCancelable$1 = pCancelableExports;
const is$1 = distExports;

class GotError extends Error {
	constructor(message, error, opts) {
		super(message);
		Error.captureStackTrace(this, this.constructor);
		this.name = 'GotError';

		if (!is$1.undefined(error.code)) {
			this.code = error.code;
		}

		Object.assign(this, {
			host: opts.host,
			hostname: opts.hostname,
			method: opts.method,
			path: opts.path,
			protocol: opts.protocol,
			url: opts.href
		});
	}
}

errors$1.GotError = GotError;

errors$1.CacheError = class extends GotError {
	constructor(error, opts) {
		super(error.message, error, opts);
		this.name = 'CacheError';
	}
};

errors$1.RequestError = class extends GotError {
	constructor(error, opts) {
		super(error.message, error, opts);
		this.name = 'RequestError';
	}
};

errors$1.ReadError = class extends GotError {
	constructor(error, opts) {
		super(error.message, error, opts);
		this.name = 'ReadError';
	}
};

errors$1.ParseError = class extends GotError {
	constructor(error, statusCode, opts, data) {
		super(`${error.message} in "${urlLib$1.format(opts)}": \n${data.slice(0, 77)}...`, error, opts);
		this.name = 'ParseError';
		this.statusCode = statusCode;
		this.statusMessage = http$1.STATUS_CODES[this.statusCode];
	}
};

errors$1.HTTPError = class extends GotError {
	constructor(statusCode, statusMessage, headers, opts) {
		if (statusMessage) {
			statusMessage = statusMessage.replace(/\r?\n/g, ' ').trim();
		} else {
			statusMessage = http$1.STATUS_CODES[statusCode];
		}
		super(`Response code ${statusCode} (${statusMessage})`, {}, opts);
		this.name = 'HTTPError';
		this.statusCode = statusCode;
		this.statusMessage = statusMessage;
		this.headers = headers;
	}
};

errors$1.MaxRedirectsError = class extends GotError {
	constructor(statusCode, redirectUrls, opts) {
		super('Redirected 10 times. Aborting.', {}, opts);
		this.name = 'MaxRedirectsError';
		this.statusCode = statusCode;
		this.statusMessage = http$1.STATUS_CODES[this.statusCode];
		this.redirectUrls = redirectUrls;
	}
};

errors$1.UnsupportedProtocolError = class extends GotError {
	constructor(opts) {
		super(`Unsupported protocol "${opts.protocol}"`, {}, opts);
		this.name = 'UnsupportedProtocolError';
	}
};

errors$1.CancelError = PCancelable$1.CancelError;

const EventEmitter = require$$4;
const http = require$$1$2;
const https = require$$3$2;
const PassThrough = require$$0$5.PassThrough;
const Transform = require$$0$5.Transform;
const urlLib = require$$0$4;
const fs$2 = require$$0$3;
const querystring = require$$6$1;
const CacheableRequest = src;
const duplexer3 = duplexer3Exports;
const intoStream = intoStreamExports;
const is = distExports;
const getStream$1 = getStreamExports;
const timedOut = timedOut$1;
const urlParseLax = urlParseLax$1;
const urlToOptions = urlToOptions_1;
const lowercaseKeys = lowercaseKeys$4;
const decompressResponse = decompressResponse$1;
const mimicResponse = mimicResponse$3;
const isRetryAllowed = isRetryAllowed$1;
const isURL = isurl$1;
const PCancelable = pCancelableExports;
const pTimeout$1 = pTimeoutExports;
const pify$1 = pify$4;
const Buffer$1 = safeBufferExports.Buffer;
const pkg = require$$24;
const errors = errors$1;

const getMethodRedirectCodes = new Set([300, 301, 302, 303, 304, 305, 307, 308]);
const allMethodRedirectCodes = new Set([300, 303, 307, 308]);

const isFormData = body => is.nodeStream(body) && is.function(body.getBoundary);

const getBodySize = opts => {
	const body = opts.body;

	if (opts.headers['content-length']) {
		return Number(opts.headers['content-length']);
	}

	if (!body && !opts.stream) {
		return 0;
	}

	if (is.string(body)) {
		return Buffer$1.byteLength(body);
	}

	if (isFormData(body)) {
		return pify$1(body.getLength.bind(body))();
	}

	if (body instanceof fs$2.ReadStream) {
		return pify$1(fs$2.stat)(body.path).then(stat => stat.size);
	}

	if (is.nodeStream(body) && is.buffer(body._buffer)) {
		return body._buffer.length;
	}

	return null;
};

function requestAsEventEmitter(opts) {
	opts = opts || {};

	const ee = new EventEmitter();
	const requestUrl = opts.href || urlLib.resolve(urlLib.format(opts), opts.path);
	const redirects = [];
	const agents = is.object(opts.agent) ? opts.agent : null;
	let retryCount = 0;
	let redirectUrl;
	let uploadBodySize;
	let uploaded = 0;

	const get = opts => {
		if (opts.protocol !== 'http:' && opts.protocol !== 'https:') {
			ee.emit('error', new got$1.UnsupportedProtocolError(opts));
			return;
		}

		let fn = opts.protocol === 'https:' ? https : http;

		if (agents) {
			const protocolName = opts.protocol === 'https:' ? 'https' : 'http';
			opts.agent = agents[protocolName] || opts.agent;
		}

		if (opts.useElectronNet && process.versions.electron) {
			const electron = require$$26;
			fn = electron.net || electron.remote.net;
		}

		let progressInterval;

		const cacheableRequest = new CacheableRequest(fn.request, opts.cache);
		const cacheReq = cacheableRequest(opts, res => {
			clearInterval(progressInterval);

			ee.emit('uploadProgress', {
				percent: 1,
				transferred: uploaded,
				total: uploadBodySize
			});

			const statusCode = res.statusCode;

			res.url = redirectUrl || requestUrl;
			res.requestUrl = requestUrl;

			const followRedirect = opts.followRedirect && 'location' in res.headers;
			const redirectGet = followRedirect && getMethodRedirectCodes.has(statusCode);
			const redirectAll = followRedirect && allMethodRedirectCodes.has(statusCode);

			if (redirectAll || (redirectGet && (opts.method === 'GET' || opts.method === 'HEAD'))) {
				res.resume();

				if (statusCode === 303) {
					// Server responded with "see other", indicating that the resource exists at another location,
					// and the client should request it from that location via GET or HEAD.
					opts.method = 'GET';
				}

				if (redirects.length >= 10) {
					ee.emit('error', new got$1.MaxRedirectsError(statusCode, redirects, opts), null, res);
					return;
				}

				const bufferString = Buffer$1.from(res.headers.location, 'binary').toString();

				redirectUrl = urlLib.resolve(urlLib.format(opts), bufferString);

				redirects.push(redirectUrl);

				const redirectOpts = Object.assign({}, opts, urlLib.parse(redirectUrl));

				ee.emit('redirect', res, redirectOpts);

				get(redirectOpts);

				return;
			}

			setImmediate(() => {
				try {
					getResponse(res, opts, ee, redirects);
				} catch (e) {
					ee.emit('error', e);
				}
			});
		});

		cacheReq.on('error', err => {
			if (err instanceof CacheableRequest.RequestError) {
				ee.emit('error', new got$1.RequestError(err, opts));
			} else {
				ee.emit('error', new got$1.CacheError(err, opts));
			}
		});

		cacheReq.once('request', req => {
			let aborted = false;
			req.once('abort', _ => {
				aborted = true;
			});

			req.once('error', err => {
				clearInterval(progressInterval);

				if (aborted) {
					return;
				}

				const backoff = opts.retries(++retryCount, err);

				if (backoff) {
					setTimeout(get, backoff, opts);
					return;
				}

				ee.emit('error', new got$1.RequestError(err, opts));
			});

			ee.once('request', req => {
				ee.emit('uploadProgress', {
					percent: 0,
					transferred: 0,
					total: uploadBodySize
				});

				const socket = req.connection;
				if (socket) {
					// `._connecting` was the old property which was made public in node v6.1.0
					const isConnecting = socket.connecting === undefined ? socket._connecting : socket.connecting;

					const onSocketConnect = () => {
						const uploadEventFrequency = 150;

						progressInterval = setInterval(() => {
							if (socket.destroyed) {
								clearInterval(progressInterval);
								return;
							}

							const lastUploaded = uploaded;
							const headersSize = req._header ? Buffer$1.byteLength(req._header) : 0;
							uploaded = socket.bytesWritten - headersSize;

							// Prevent the known issue of `bytesWritten` being larger than body size
							if (uploadBodySize && uploaded > uploadBodySize) {
								uploaded = uploadBodySize;
							}

							// Don't emit events with unchanged progress and
							// prevent last event from being emitted, because
							// it's emitted when `response` is emitted
							if (uploaded === lastUploaded || uploaded === uploadBodySize) {
								return;
							}

							ee.emit('uploadProgress', {
								percent: uploadBodySize ? uploaded / uploadBodySize : 0,
								transferred: uploaded,
								total: uploadBodySize
							});
						}, uploadEventFrequency);
					};

					// Only subscribe to 'connect' event if we're actually connecting a new
					// socket, otherwise if we're already connected (because this is a
					// keep-alive connection) do not bother. This is important since we won't
					// get a 'connect' event for an already connected socket.
					if (isConnecting) {
						socket.once('connect', onSocketConnect);
					} else {
						onSocketConnect();
					}
				}
			});

			if (opts.gotTimeout) {
				clearInterval(progressInterval);
				timedOut(req, opts.gotTimeout);
			}

			setImmediate(() => {
				ee.emit('request', req);
			});
		});
	};

	setImmediate(() => {
		Promise.resolve(getBodySize(opts))
			.then(size => {
				uploadBodySize = size;

				if (
					is.undefined(opts.headers['content-length']) &&
					is.undefined(opts.headers['transfer-encoding']) &&
					isFormData(opts.body)
				) {
					opts.headers['content-length'] = size;
				}

				get(opts);
			})
			.catch(err => {
				ee.emit('error', err);
			});
	});

	return ee;
}

function getResponse(res, opts, ee, redirects) {
	const downloadBodySize = Number(res.headers['content-length']) || null;
	let downloaded = 0;

	const progressStream = new Transform({
		transform(chunk, encoding, callback) {
			downloaded += chunk.length;

			const percent = downloadBodySize ? downloaded / downloadBodySize : 0;

			// Let flush() be responsible for emitting the last event
			if (percent < 1) {
				ee.emit('downloadProgress', {
					percent,
					transferred: downloaded,
					total: downloadBodySize
				});
			}

			callback(null, chunk);
		},

		flush(callback) {
			ee.emit('downloadProgress', {
				percent: 1,
				transferred: downloaded,
				total: downloadBodySize
			});

			callback();
		}
	});

	mimicResponse(res, progressStream);
	progressStream.redirectUrls = redirects;

	const response = opts.decompress === true &&
		is.function(decompressResponse) &&
		opts.method !== 'HEAD' ? decompressResponse(progressStream) : progressStream;

	if (!opts.decompress && ['gzip', 'deflate'].indexOf(res.headers['content-encoding']) !== -1) {
		opts.encoding = null;
	}

	ee.emit('response', response);

	ee.emit('downloadProgress', {
		percent: 0,
		transferred: 0,
		total: downloadBodySize
	});

	res.pipe(progressStream);
}

function asPromise(opts) {
	const timeoutFn = requestPromise => opts.gotTimeout && opts.gotTimeout.request ?
		pTimeout$1(requestPromise, opts.gotTimeout.request, new got$1.RequestError({message: 'Request timed out', code: 'ETIMEDOUT'}, opts)) :
		requestPromise;

	const proxy = new EventEmitter();

	const cancelable = new PCancelable((resolve, reject, onCancel) => {
		const ee = requestAsEventEmitter(opts);
		let cancelOnRequest = false;

		onCancel(() => {
			cancelOnRequest = true;
		});

		ee.on('request', req => {
			if (cancelOnRequest) {
				req.abort();
			}

			onCancel(() => {
				req.abort();
			});

			if (is.nodeStream(opts.body)) {
				opts.body.pipe(req);
				opts.body = undefined;
				return;
			}

			req.end(opts.body);
		});

		ee.on('response', res => {
			const stream = is.null(opts.encoding) ? getStream$1.buffer(res) : getStream$1(res, opts);

			stream
				.catch(err => reject(new got$1.ReadError(err, opts)))
				.then(data => {
					const statusCode = res.statusCode;
					const limitStatusCode = opts.followRedirect ? 299 : 399;

					res.body = data;

					if (opts.json && res.body) {
						try {
							res.body = JSON.parse(res.body);
						} catch (err) {
							if (statusCode >= 200 && statusCode < 300) {
								throw new got$1.ParseError(err, statusCode, opts, data);
							}
						}
					}

					if (opts.throwHttpErrors && statusCode !== 304 && (statusCode < 200 || statusCode > limitStatusCode)) {
						throw new got$1.HTTPError(statusCode, res.statusMessage, res.headers, opts);
					}

					resolve(res);
				})
				.catch(err => {
					Object.defineProperty(err, 'response', {value: res});
					reject(err);
				});
		});

		ee.once('error', reject);
		ee.on('redirect', proxy.emit.bind(proxy, 'redirect'));
		ee.on('uploadProgress', proxy.emit.bind(proxy, 'uploadProgress'));
		ee.on('downloadProgress', proxy.emit.bind(proxy, 'downloadProgress'));
	});

	// Preserve backwards-compatibility
	// TODO: Remove this in the next major version
	Object.defineProperty(cancelable, 'canceled', {
		get() {
			return cancelable.isCanceled;
		}
	});

	const promise = timeoutFn(cancelable);

	promise.cancel = cancelable.cancel.bind(cancelable);

	promise.on = (name, fn) => {
		proxy.on(name, fn);
		return promise;
	};

	return promise;
}

function asStream(opts) {
	opts.stream = true;

	const input = new PassThrough();
	const output = new PassThrough();
	const proxy = duplexer3(input, output);
	let timeout;

	if (opts.gotTimeout && opts.gotTimeout.request) {
		timeout = setTimeout(() => {
			proxy.emit('error', new got$1.RequestError({message: 'Request timed out', code: 'ETIMEDOUT'}, opts));
		}, opts.gotTimeout.request);
	}

	if (opts.json) {
		throw new Error('Got can not be used as a stream when the `json` option is used');
	}

	if (opts.body) {
		proxy.write = () => {
			throw new Error('Got\'s stream is not writable when the `body` option is used');
		};
	}

	const ee = requestAsEventEmitter(opts);

	ee.on('request', req => {
		proxy.emit('request', req);

		if (is.nodeStream(opts.body)) {
			opts.body.pipe(req);
			return;
		}

		if (opts.body) {
			req.end(opts.body);
			return;
		}

		if (opts.method === 'POST' || opts.method === 'PUT' || opts.method === 'PATCH') {
			input.pipe(req);
			return;
		}

		req.end();
	});

	ee.on('response', res => {
		clearTimeout(timeout);

		const statusCode = res.statusCode;

		res.on('error', err => {
			proxy.emit('error', new got$1.ReadError(err, opts));
		});

		res.pipe(output);

		if (opts.throwHttpErrors && statusCode !== 304 && (statusCode < 200 || statusCode > 299)) {
			proxy.emit('error', new got$1.HTTPError(statusCode, res.statusMessage, res.headers, opts), null, res);
			return;
		}

		proxy.emit('response', res);
	});

	ee.on('error', proxy.emit.bind(proxy, 'error'));
	ee.on('redirect', proxy.emit.bind(proxy, 'redirect'));
	ee.on('uploadProgress', proxy.emit.bind(proxy, 'uploadProgress'));
	ee.on('downloadProgress', proxy.emit.bind(proxy, 'downloadProgress'));

	return proxy;
}

function normalizeArguments(url, opts) {
	if (!is.string(url) && !is.object(url)) {
		throw new TypeError(`Parameter \`url\` must be a string or object, not ${is(url)}`);
	} else if (is.string(url)) {
		url = url.replace(/^unix:/, 'http://$&');

		try {
			decodeURI(url);
		} catch (err) {
			throw new Error('Parameter `url` must contain valid UTF-8 character sequences');
		}

		url = urlParseLax(url);
		if (url.auth) {
			throw new Error('Basic authentication must be done with the `auth` option');
		}
	} else if (isURL.lenient(url)) {
		url = urlToOptions(url);
	}

	opts = Object.assign(
		{
			path: '',
			retries: 2,
			cache: false,
			decompress: true,
			useElectronNet: false,
			throwHttpErrors: true
		},
		url,
		{
			protocol: url.protocol || 'http:' // Override both null/undefined with default protocol
		},
		opts
	);

	const headers = lowercaseKeys(opts.headers);
	for (const key of Object.keys(headers)) {
		if (is.nullOrUndefined(headers[key])) {
			delete headers[key];
		}
	}

	opts.headers = Object.assign({
		'user-agent': `${pkg.name}/${pkg.version} (https://github.com/sindresorhus/got)`
	}, headers);

	if (opts.decompress && is.undefined(opts.headers['accept-encoding'])) {
		opts.headers['accept-encoding'] = 'gzip, deflate';
	}

	const query = opts.query;

	if (query) {
		if (!is.string(query)) {
			opts.query = querystring.stringify(query);
		}

		opts.path = `${opts.path.split('?')[0]}?${opts.query}`;
		delete opts.query;
	}

	if (opts.json && is.undefined(opts.headers.accept)) {
		opts.headers.accept = 'application/json';
	}

	const body = opts.body;
	if (is.nullOrUndefined(body)) {
		opts.method = (opts.method || 'GET').toUpperCase();
	} else {
		const headers = opts.headers;
		if (!is.nodeStream(body) && !is.string(body) && !is.buffer(body) && !(opts.form || opts.json)) {
			throw new TypeError('The `body` option must be a stream.Readable, string, Buffer or plain Object');
		}

		const canBodyBeStringified = is.plainObject(body) || is.array(body);
		if ((opts.form || opts.json) && !canBodyBeStringified) {
			throw new TypeError('The `body` option must be a plain Object or Array when the `form` or `json` option is used');
		}

		if (isFormData(body)) {
			// Special case for https://github.com/form-data/form-data
			headers['content-type'] = headers['content-type'] || `multipart/form-data; boundary=${body.getBoundary()}`;
		} else if (opts.form && canBodyBeStringified) {
			headers['content-type'] = headers['content-type'] || 'application/x-www-form-urlencoded';
			opts.body = querystring.stringify(body);
		} else if (opts.json && canBodyBeStringified) {
			headers['content-type'] = headers['content-type'] || 'application/json';
			opts.body = JSON.stringify(body);
		}

		if (is.undefined(headers['content-length']) && is.undefined(headers['transfer-encoding']) && !is.nodeStream(body)) {
			const length = is.string(opts.body) ? Buffer$1.byteLength(opts.body) : opts.body.length;
			headers['content-length'] = length;
		}

		// Convert buffer to stream to receive upload progress events
		// see https://github.com/sindresorhus/got/pull/322
		if (is.buffer(body)) {
			opts.body = intoStream(body);
			opts.body._buffer = body;
		}

		opts.method = (opts.method || 'POST').toUpperCase();
	}

	if (opts.hostname === 'unix') {
		const matches = /(.+?):(.+)/.exec(opts.path);

		if (matches) {
			opts.socketPath = matches[1];
			opts.path = matches[2];
			opts.host = null;
		}
	}

	if (!is.function(opts.retries)) {
		const retries = opts.retries;

		opts.retries = (iter, err) => {
			if (iter > retries || !isRetryAllowed(err)) {
				return 0;
			}

			const noise = Math.random() * 100;

			return ((1 << iter) * 1000) + noise;
		};
	}

	if (is.undefined(opts.followRedirect)) {
		opts.followRedirect = true;
	}

	if (opts.timeout) {
		if (is.number(opts.timeout)) {
			opts.gotTimeout = {request: opts.timeout};
		} else {
			opts.gotTimeout = opts.timeout;
		}
		delete opts.timeout;
	}

	return opts;
}

function got$1(url, opts) {
	try {
		const normalizedArgs = normalizeArguments(url, opts);

		if (normalizedArgs.stream) {
			return asStream(normalizedArgs);
		}

		return asPromise(normalizedArgs);
	} catch (err) {
		return Promise.reject(err);
	}
}

got$1.stream = (url, opts) => asStream(normalizeArguments(url, opts));

const methods = [
	'get',
	'post',
	'put',
	'patch',
	'head',
	'delete'
];

for (const method of methods) {
	got$1[method] = (url, opts) => got$1(url, Object.assign({}, opts, {method}));
	got$1.stream[method] = (url, opts) => got$1.stream(url, Object.assign({}, opts, {method}));
}

Object.assign(got$1, errors);

var got_1 = got$1;

var pEvent$1 = {exports: {}};

const pTimeout = pTimeoutExports;

const symbolAsyncIterator = Symbol.asyncIterator || '@@asyncIterator';

const normalizeEmitter = emitter => {
	const addListener = emitter.on || emitter.addListener || emitter.addEventListener;
	const removeListener = emitter.off || emitter.removeListener || emitter.removeEventListener;

	if (!addListener || !removeListener) {
		throw new TypeError('Emitter is not compatible');
	}

	return {
		addListener: addListener.bind(emitter),
		removeListener: removeListener.bind(emitter)
	};
};

const normalizeEvents = event => Array.isArray(event) ? event : [event];

const multiple = (emitter, event, options) => {
	let cancel;
	const ret = new Promise((resolve, reject) => {
		options = Object.assign({
			rejectionEvents: ['error'],
			multiArgs: false,
			resolveImmediately: false
		}, options);

		if (!(options.count >= 0 && (options.count === Infinity || Number.isInteger(options.count)))) {
			throw new TypeError('The `count` option should be at least 0 or more');
		}

		// Allow multiple events
		const events = normalizeEvents(event);

		const items = [];
		const {addListener, removeListener} = normalizeEmitter(emitter);

		const onItem = (...args) => {
			const value = options.multiArgs ? args : args[0];

			if (options.filter && !options.filter(value)) {
				return;
			}

			items.push(value);

			if (options.count === items.length) {
				cancel();
				resolve(items);
			}
		};

		const rejectHandler = error => {
			cancel();
			reject(error);
		};

		cancel = () => {
			for (const event of events) {
				removeListener(event, onItem);
			}

			for (const rejectionEvent of options.rejectionEvents) {
				removeListener(rejectionEvent, rejectHandler);
			}
		};

		for (const event of events) {
			addListener(event, onItem);
		}

		for (const rejectionEvent of options.rejectionEvents) {
			addListener(rejectionEvent, rejectHandler);
		}

		if (options.resolveImmediately) {
			resolve(items);
		}
	});

	ret.cancel = cancel;

	if (typeof options.timeout === 'number') {
		const timeout = pTimeout(ret, options.timeout);
		timeout.cancel = cancel;
		return timeout;
	}

	return ret;
};

pEvent$1.exports = (emitter, event, options) => {
	if (typeof options === 'function') {
		options = {filter: options};
	}

	options = Object.assign({}, options, {
		count: 1,
		resolveImmediately: false
	});

	const arrayPromise = multiple(emitter, event, options);

	const promise = arrayPromise.then(array => array[0]);
	promise.cancel = arrayPromise.cancel;

	return promise;
};

pEvent$1.exports.multiple = multiple;

pEvent$1.exports.iterator = (emitter, event, options) => {
	if (typeof options === 'function') {
		options = {filter: options};
	}

	// Allow multiple events
	const events = normalizeEvents(event);

	options = Object.assign({
		rejectionEvents: ['error'],
		resolutionEvents: [],
		limit: Infinity,
		multiArgs: false
	}, options);

	const {limit} = options;
	const isValidLimit = limit >= 0 && (limit === Infinity || Number.isInteger(limit));
	if (!isValidLimit) {
		throw new TypeError('The `limit` option should be a non-negative integer or Infinity');
	}

	if (limit === 0) {
		// Return an empty async iterator to avoid any further cost
		return {
			[Symbol.asyncIterator]() {
				return this;
			},
			next() {
				return Promise.resolve({done: true, value: undefined});
			}
		};
	}

	let isLimitReached = false;

	const {addListener, removeListener} = normalizeEmitter(emitter);

	let done = false;
	let error;
	let hasPendingError = false;
	const nextQueue = [];
	const valueQueue = [];
	let eventCount = 0;

	const valueHandler = (...args) => {
		eventCount++;
		isLimitReached = eventCount === limit;

		const value = options.multiArgs ? args : args[0];

		if (nextQueue.length > 0) {
			const {resolve} = nextQueue.shift();

			resolve({done: false, value});

			if (isLimitReached) {
				cancel();
			}

			return;
		}

		valueQueue.push(value);

		if (isLimitReached) {
			cancel();
		}
	};

	const cancel = () => {
		done = true;
		for (const event of events) {
			removeListener(event, valueHandler);
		}

		for (const rejectionEvent of options.rejectionEvents) {
			removeListener(rejectionEvent, rejectHandler);
		}

		for (const resolutionEvent of options.resolutionEvents) {
			removeListener(resolutionEvent, resolveHandler);
		}

		while (nextQueue.length > 0) {
			const {resolve} = nextQueue.shift();
			resolve({done: true, value: undefined});
		}
	};

	const rejectHandler = (...args) => {
		error = options.multiArgs ? args : args[0];

		if (nextQueue.length > 0) {
			const {reject} = nextQueue.shift();
			reject(error);
		} else {
			hasPendingError = true;
		}

		cancel();
	};

	const resolveHandler = (...args) => {
		const value = options.multiArgs ? args : args[0];

		if (options.filter && !options.filter(value)) {
			return;
		}

		if (nextQueue.length > 0) {
			const {resolve} = nextQueue.shift();
			resolve({done: true, value});
		} else {
			valueQueue.push(value);
		}

		cancel();
	};

	for (const event of events) {
		addListener(event, valueHandler);
	}

	for (const rejectionEvent of options.rejectionEvents) {
		addListener(rejectionEvent, rejectHandler);
	}

	for (const resolutionEvent of options.resolutionEvents) {
		addListener(resolutionEvent, resolveHandler);
	}

	return {
		[symbolAsyncIterator]() {
			return this;
		},
		next() {
			if (valueQueue.length > 0) {
				const value = valueQueue.shift();
				return Promise.resolve({done: done && valueQueue.length === 0 && !isLimitReached, value});
			}

			if (hasPendingError) {
				hasPendingError = false;
				return Promise.reject(error);
			}

			if (done) {
				return Promise.resolve({done: true, value: undefined});
			}

			return new Promise((resolve, reject) => nextQueue.push({resolve, reject}));
		},
		return(value) {
			cancel();
			return Promise.resolve({done, value});
		}
	};
};

var pEventExports = pEvent$1.exports;

const toBytes = s => [...s].map(c => c.charCodeAt(0));
const xpiZipFilename = toBytes('META-INF/mozilla.rsa');
const oxmlContentTypes = toBytes('[Content_Types].xml');
const oxmlRels = toBytes('_rels/.rels');

var fileType$1 = input => {
	const buf = input instanceof Uint8Array ? input : new Uint8Array(input);

	if (!(buf && buf.length > 1)) {
		return null;
	}

	const check = (header, options) => {
		options = Object.assign({
			offset: 0
		}, options);

		for (let i = 0; i < header.length; i++) {
			// If a bitmask is set
			if (options.mask) {
				// If header doesn't equal `buf` with bits masked off
				if (header[i] !== (options.mask[i] & buf[i + options.offset])) {
					return false;
				}
			} else if (header[i] !== buf[i + options.offset]) {
				return false;
			}
		}

		return true;
	};

	const checkString = (header, options) => check(toBytes(header), options);

	if (check([0xFF, 0xD8, 0xFF])) {
		return {
			ext: 'jpg',
			mime: 'image/jpeg'
		};
	}

	if (check([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
		return {
			ext: 'png',
			mime: 'image/png'
		};
	}

	if (check([0x47, 0x49, 0x46])) {
		return {
			ext: 'gif',
			mime: 'image/gif'
		};
	}

	if (check([0x57, 0x45, 0x42, 0x50], {offset: 8})) {
		return {
			ext: 'webp',
			mime: 'image/webp'
		};
	}

	if (check([0x46, 0x4C, 0x49, 0x46])) {
		return {
			ext: 'flif',
			mime: 'image/flif'
		};
	}

	// Needs to be before `tif` check
	if (
		(check([0x49, 0x49, 0x2A, 0x0]) || check([0x4D, 0x4D, 0x0, 0x2A])) &&
		check([0x43, 0x52], {offset: 8})
	) {
		return {
			ext: 'cr2',
			mime: 'image/x-canon-cr2'
		};
	}

	if (
		check([0x49, 0x49, 0x2A, 0x0]) ||
		check([0x4D, 0x4D, 0x0, 0x2A])
	) {
		return {
			ext: 'tif',
			mime: 'image/tiff'
		};
	}

	if (check([0x42, 0x4D])) {
		return {
			ext: 'bmp',
			mime: 'image/bmp'
		};
	}

	if (check([0x49, 0x49, 0xBC])) {
		return {
			ext: 'jxr',
			mime: 'image/vnd.ms-photo'
		};
	}

	if (check([0x38, 0x42, 0x50, 0x53])) {
		return {
			ext: 'psd',
			mime: 'image/vnd.adobe.photoshop'
		};
	}

	// Zip-based file formats
	// Need to be before the `zip` check
	if (check([0x50, 0x4B, 0x3, 0x4])) {
		if (
			check([0x6D, 0x69, 0x6D, 0x65, 0x74, 0x79, 0x70, 0x65, 0x61, 0x70, 0x70, 0x6C, 0x69, 0x63, 0x61, 0x74, 0x69, 0x6F, 0x6E, 0x2F, 0x65, 0x70, 0x75, 0x62, 0x2B, 0x7A, 0x69, 0x70], {offset: 30})
		) {
			return {
				ext: 'epub',
				mime: 'application/epub+zip'
			};
		}

		// Assumes signed `.xpi` from addons.mozilla.org
		if (check(xpiZipFilename, {offset: 30})) {
			return {
				ext: 'xpi',
				mime: 'application/x-xpinstall'
			};
		}

		if (checkString('mimetypeapplication/vnd.oasis.opendocument.text', {offset: 30})) {
			return {
				ext: 'odt',
				mime: 'application/vnd.oasis.opendocument.text'
			};
		}

		if (checkString('mimetypeapplication/vnd.oasis.opendocument.spreadsheet', {offset: 30})) {
			return {
				ext: 'ods',
				mime: 'application/vnd.oasis.opendocument.spreadsheet'
			};
		}

		if (checkString('mimetypeapplication/vnd.oasis.opendocument.presentation', {offset: 30})) {
			return {
				ext: 'odp',
				mime: 'application/vnd.oasis.opendocument.presentation'
			};
		}

		// https://github.com/file/file/blob/master/magic/Magdir/msooxml
		if (check(oxmlContentTypes, {offset: 30}) || check(oxmlRels, {offset: 30})) {
			const sliced = buf.subarray(4, 4 + 2000);
			const nextZipHeaderIndex = arr => arr.findIndex((el, i, arr) => arr[i] === 0x50 && arr[i + 1] === 0x4B && arr[i + 2] === 0x3 && arr[i + 3] === 0x4);
			const header2Pos = nextZipHeaderIndex(sliced);

			if (header2Pos !== -1) {
				const slicedAgain = buf.subarray(header2Pos + 8, header2Pos + 8 + 1000);
				const header3Pos = nextZipHeaderIndex(slicedAgain);

				if (header3Pos !== -1) {
					const offset = 8 + header2Pos + header3Pos + 30;

					if (checkString('word/', {offset})) {
						return {
							ext: 'docx',
							mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
						};
					}

					if (checkString('ppt/', {offset})) {
						return {
							ext: 'pptx',
							mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
						};
					}

					if (checkString('xl/', {offset})) {
						return {
							ext: 'xlsx',
							mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
						};
					}
				}
			}
		}
	}

	if (
		check([0x50, 0x4B]) &&
		(buf[2] === 0x3 || buf[2] === 0x5 || buf[2] === 0x7) &&
		(buf[3] === 0x4 || buf[3] === 0x6 || buf[3] === 0x8)
	) {
		return {
			ext: 'zip',
			mime: 'application/zip'
		};
	}

	if (check([0x75, 0x73, 0x74, 0x61, 0x72], {offset: 257})) {
		return {
			ext: 'tar',
			mime: 'application/x-tar'
		};
	}

	if (
		check([0x52, 0x61, 0x72, 0x21, 0x1A, 0x7]) &&
		(buf[6] === 0x0 || buf[6] === 0x1)
	) {
		return {
			ext: 'rar',
			mime: 'application/x-rar-compressed'
		};
	}

	if (check([0x1F, 0x8B, 0x8])) {
		return {
			ext: 'gz',
			mime: 'application/gzip'
		};
	}

	if (check([0x42, 0x5A, 0x68])) {
		return {
			ext: 'bz2',
			mime: 'application/x-bzip2'
		};
	}

	if (check([0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C])) {
		return {
			ext: '7z',
			mime: 'application/x-7z-compressed'
		};
	}

	if (check([0x78, 0x01])) {
		return {
			ext: 'dmg',
			mime: 'application/x-apple-diskimage'
		};
	}

	if (check([0x33, 0x67, 0x70, 0x35]) || // 3gp5
		(
			check([0x0, 0x0, 0x0]) && check([0x66, 0x74, 0x79, 0x70], {offset: 4}) &&
				(
					check([0x6D, 0x70, 0x34, 0x31], {offset: 8}) || // MP41
					check([0x6D, 0x70, 0x34, 0x32], {offset: 8}) || // MP42
					check([0x69, 0x73, 0x6F, 0x6D], {offset: 8}) || // ISOM
					check([0x69, 0x73, 0x6F, 0x32], {offset: 8}) || // ISO2
					check([0x6D, 0x6D, 0x70, 0x34], {offset: 8}) || // MMP4
					check([0x4D, 0x34, 0x56], {offset: 8}) || // M4V
					check([0x64, 0x61, 0x73, 0x68], {offset: 8}) // DASH
				)
		)) {
		return {
			ext: 'mp4',
			mime: 'video/mp4'
		};
	}

	if (check([0x4D, 0x54, 0x68, 0x64])) {
		return {
			ext: 'mid',
			mime: 'audio/midi'
		};
	}

	// https://github.com/threatstack/libmagic/blob/master/magic/Magdir/matroska
	if (check([0x1A, 0x45, 0xDF, 0xA3])) {
		const sliced = buf.subarray(4, 4 + 4096);
		const idPos = sliced.findIndex((el, i, arr) => arr[i] === 0x42 && arr[i + 1] === 0x82);

		if (idPos !== -1) {
			const docTypePos = idPos + 3;
			const findDocType = type => [...type].every((c, i) => sliced[docTypePos + i] === c.charCodeAt(0));

			if (findDocType('matroska')) {
				return {
					ext: 'mkv',
					mime: 'video/x-matroska'
				};
			}

			if (findDocType('webm')) {
				return {
					ext: 'webm',
					mime: 'video/webm'
				};
			}
		}
	}

	if (check([0x0, 0x0, 0x0, 0x14, 0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20]) ||
		check([0x66, 0x72, 0x65, 0x65], {offset: 4}) ||
		check([0x66, 0x74, 0x79, 0x70, 0x71, 0x74, 0x20, 0x20], {offset: 4}) ||
		check([0x6D, 0x64, 0x61, 0x74], {offset: 4}) || // MJPEG
		check([0x77, 0x69, 0x64, 0x65], {offset: 4})) {
		return {
			ext: 'mov',
			mime: 'video/quicktime'
		};
	}

	// RIFF file format which might be AVI, WAV, QCP, etc
	if (check([0x52, 0x49, 0x46, 0x46])) {
		if (check([0x41, 0x56, 0x49], {offset: 8})) {
			return {
				ext: 'avi',
				mime: 'video/x-msvideo'
			};
		}
		if (check([0x57, 0x41, 0x56, 0x45], {offset: 8})) {
			return {
				ext: 'wav',
				mime: 'audio/x-wav'
			};
		}
		// QLCM, QCP file
		if (check([0x51, 0x4C, 0x43, 0x4D], {offset: 8})) {
			return {
				ext: 'qcp',
				mime: 'audio/qcelp'
			};
		}
	}

	if (check([0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11, 0xA6, 0xD9])) {
		return {
			ext: 'wmv',
			mime: 'video/x-ms-wmv'
		};
	}

	if (
		check([0x0, 0x0, 0x1, 0xBA]) ||
		check([0x0, 0x0, 0x1, 0xB3])
	) {
		return {
			ext: 'mpg',
			mime: 'video/mpeg'
		};
	}

	if (check([0x66, 0x74, 0x79, 0x70, 0x33, 0x67], {offset: 4})) {
		return {
			ext: '3gp',
			mime: 'video/3gpp'
		};
	}

	// Check for MPEG header at different starting offsets
	for (let start = 0; start < 2 && start < (buf.length - 16); start++) {
		if (
			check([0x49, 0x44, 0x33], {offset: start}) || // ID3 header
			check([0xFF, 0xE2], {offset: start, mask: [0xFF, 0xE2]}) // MPEG 1 or 2 Layer 3 header
		) {
			return {
				ext: 'mp3',
				mime: 'audio/mpeg'
			};
		}

		if (
			check([0xFF, 0xE4], {offset: start, mask: [0xFF, 0xE4]}) // MPEG 1 or 2 Layer 2 header
		) {
			return {
				ext: 'mp2',
				mime: 'audio/mpeg'
			};
		}

		if (
			check([0xFF, 0xF8], {offset: start, mask: [0xFF, 0xFC]}) // MPEG 2 layer 0 using ADTS
		) {
			return {
				ext: 'mp2',
				mime: 'audio/mpeg'
			};
		}

		if (
			check([0xFF, 0xF0], {offset: start, mask: [0xFF, 0xFC]}) // MPEG 4 layer 0 using ADTS
		) {
			return {
				ext: 'mp4',
				mime: 'audio/mpeg'
			};
		}
	}

	if (
		check([0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x41], {offset: 4}) ||
		check([0x4D, 0x34, 0x41, 0x20])
	) {
		return {
			ext: 'm4a',
			mime: 'audio/m4a'
		};
	}

	// Needs to be before `ogg` check
	if (check([0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64], {offset: 28})) {
		return {
			ext: 'opus',
			mime: 'audio/opus'
		};
	}

	// If 'OggS' in first  bytes, then OGG container
	if (check([0x4F, 0x67, 0x67, 0x53])) {
		// This is a OGG container

		// If ' theora' in header.
		if (check([0x80, 0x74, 0x68, 0x65, 0x6F, 0x72, 0x61], {offset: 28})) {
			return {
				ext: 'ogv',
				mime: 'video/ogg'
			};
		}
		// If '\x01video' in header.
		if (check([0x01, 0x76, 0x69, 0x64, 0x65, 0x6F, 0x00], {offset: 28})) {
			return {
				ext: 'ogm',
				mime: 'video/ogg'
			};
		}
		// If ' FLAC' in header  https://xiph.org/flac/faq.html
		if (check([0x7F, 0x46, 0x4C, 0x41, 0x43], {offset: 28})) {
			return {
				ext: 'oga',
				mime: 'audio/ogg'
			};
		}

		// 'Speex  ' in header https://en.wikipedia.org/wiki/Speex
		if (check([0x53, 0x70, 0x65, 0x65, 0x78, 0x20, 0x20], {offset: 28})) {
			return {
				ext: 'spx',
				mime: 'audio/ogg'
			};
		}

		// If '\x01vorbis' in header
		if (check([0x01, 0x76, 0x6F, 0x72, 0x62, 0x69, 0x73], {offset: 28})) {
			return {
				ext: 'ogg',
				mime: 'audio/ogg'
			};
		}

		// Default OGG container https://www.iana.org/assignments/media-types/application/ogg
		return {
			ext: 'ogx',
			mime: 'application/ogg'
		};
	}

	if (check([0x66, 0x4C, 0x61, 0x43])) {
		return {
			ext: 'flac',
			mime: 'audio/x-flac'
		};
	}

	if (check([0x4D, 0x41, 0x43, 0x20])) {
		return {
			ext: 'ape',
			mime: 'audio/ape'
		};
	}

	if (check([0x23, 0x21, 0x41, 0x4D, 0x52, 0x0A])) {
		return {
			ext: 'amr',
			mime: 'audio/amr'
		};
	}

	if (check([0x25, 0x50, 0x44, 0x46])) {
		return {
			ext: 'pdf',
			mime: 'application/pdf'
		};
	}

	if (check([0x4D, 0x5A])) {
		return {
			ext: 'exe',
			mime: 'application/x-msdownload'
		};
	}

	if (
		(buf[0] === 0x43 || buf[0] === 0x46) &&
		check([0x57, 0x53], {offset: 1})
	) {
		return {
			ext: 'swf',
			mime: 'application/x-shockwave-flash'
		};
	}

	if (check([0x7B, 0x5C, 0x72, 0x74, 0x66])) {
		return {
			ext: 'rtf',
			mime: 'application/rtf'
		};
	}

	if (check([0x00, 0x61, 0x73, 0x6D])) {
		return {
			ext: 'wasm',
			mime: 'application/wasm'
		};
	}

	if (
		check([0x77, 0x4F, 0x46, 0x46]) &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			check([0x4F, 0x54, 0x54, 0x4F], {offset: 4})
		)
	) {
		return {
			ext: 'woff',
			mime: 'font/woff'
		};
	}

	if (
		check([0x77, 0x4F, 0x46, 0x32]) &&
		(
			check([0x00, 0x01, 0x00, 0x00], {offset: 4}) ||
			check([0x4F, 0x54, 0x54, 0x4F], {offset: 4})
		)
	) {
		return {
			ext: 'woff2',
			mime: 'font/woff2'
		};
	}

	if (
		check([0x4C, 0x50], {offset: 34}) &&
		(
			check([0x00, 0x00, 0x01], {offset: 8}) ||
			check([0x01, 0x00, 0x02], {offset: 8}) ||
			check([0x02, 0x00, 0x02], {offset: 8})
		)
	) {
		return {
			ext: 'eot',
			mime: 'application/octet-stream'
		};
	}

	if (check([0x00, 0x01, 0x00, 0x00, 0x00])) {
		return {
			ext: 'ttf',
			mime: 'font/ttf'
		};
	}

	if (check([0x4F, 0x54, 0x54, 0x4F, 0x00])) {
		return {
			ext: 'otf',
			mime: 'font/otf'
		};
	}

	if (check([0x00, 0x00, 0x01, 0x00])) {
		return {
			ext: 'ico',
			mime: 'image/x-icon'
		};
	}

	if (check([0x00, 0x00, 0x02, 0x00])) {
		return {
			ext: 'cur',
			mime: 'image/x-icon'
		};
	}

	if (check([0x46, 0x4C, 0x56, 0x01])) {
		return {
			ext: 'flv',
			mime: 'video/x-flv'
		};
	}

	if (check([0x25, 0x21])) {
		return {
			ext: 'ps',
			mime: 'application/postscript'
		};
	}

	if (check([0xFD, 0x37, 0x7A, 0x58, 0x5A, 0x00])) {
		return {
			ext: 'xz',
			mime: 'application/x-xz'
		};
	}

	if (check([0x53, 0x51, 0x4C, 0x69])) {
		return {
			ext: 'sqlite',
			mime: 'application/x-sqlite3'
		};
	}

	if (check([0x4E, 0x45, 0x53, 0x1A])) {
		return {
			ext: 'nes',
			mime: 'application/x-nintendo-nes-rom'
		};
	}

	if (check([0x43, 0x72, 0x32, 0x34])) {
		return {
			ext: 'crx',
			mime: 'application/x-google-chrome-extension'
		};
	}

	if (
		check([0x4D, 0x53, 0x43, 0x46]) ||
		check([0x49, 0x53, 0x63, 0x28])
	) {
		return {
			ext: 'cab',
			mime: 'application/vnd.ms-cab-compressed'
		};
	}

	// Needs to be before `ar` check
	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E, 0x0A, 0x64, 0x65, 0x62, 0x69, 0x61, 0x6E, 0x2D, 0x62, 0x69, 0x6E, 0x61, 0x72, 0x79])) {
		return {
			ext: 'deb',
			mime: 'application/x-deb'
		};
	}

	if (check([0x21, 0x3C, 0x61, 0x72, 0x63, 0x68, 0x3E])) {
		return {
			ext: 'ar',
			mime: 'application/x-unix-archive'
		};
	}

	if (check([0xED, 0xAB, 0xEE, 0xDB])) {
		return {
			ext: 'rpm',
			mime: 'application/x-rpm'
		};
	}

	if (
		check([0x1F, 0xA0]) ||
		check([0x1F, 0x9D])
	) {
		return {
			ext: 'Z',
			mime: 'application/x-compress'
		};
	}

	if (check([0x4C, 0x5A, 0x49, 0x50])) {
		return {
			ext: 'lz',
			mime: 'application/x-lzip'
		};
	}

	if (check([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1])) {
		return {
			ext: 'msi',
			mime: 'application/x-msi'
		};
	}

	if (check([0x06, 0x0E, 0x2B, 0x34, 0x02, 0x05, 0x01, 0x01, 0x0D, 0x01, 0x02, 0x01, 0x01, 0x02])) {
		return {
			ext: 'mxf',
			mime: 'application/mxf'
		};
	}

	if (check([0x47], {offset: 4}) && (check([0x47], {offset: 192}) || check([0x47], {offset: 196}))) {
		return {
			ext: 'mts',
			mime: 'video/mp2t'
		};
	}

	if (check([0x42, 0x4C, 0x45, 0x4E, 0x44, 0x45, 0x52])) {
		return {
			ext: 'blend',
			mime: 'application/x-blender'
		};
	}

	if (check([0x42, 0x50, 0x47, 0xFB])) {
		return {
			ext: 'bpg',
			mime: 'image/bpg'
		};
	}

	if (check([0x00, 0x00, 0x00, 0x0C, 0x6A, 0x50, 0x20, 0x20, 0x0D, 0x0A, 0x87, 0x0A])) {
		// JPEG-2000 family

		if (check([0x6A, 0x70, 0x32, 0x20], {offset: 20})) {
			return {
				ext: 'jp2',
				mime: 'image/jp2'
			};
		}

		if (check([0x6A, 0x70, 0x78, 0x20], {offset: 20})) {
			return {
				ext: 'jpx',
				mime: 'image/jpx'
			};
		}

		if (check([0x6A, 0x70, 0x6D, 0x20], {offset: 20})) {
			return {
				ext: 'jpm',
				mime: 'image/jpm'
			};
		}

		if (check([0x6D, 0x6A, 0x70, 0x32], {offset: 20})) {
			return {
				ext: 'mj2',
				mime: 'image/mj2'
			};
		}
	}

	if (check([0x46, 0x4F, 0x52, 0x4D, 0x00])) {
		return {
			ext: 'aif',
			mime: 'audio/aiff'
		};
	}

	if (checkString('<?xml ')) {
		return {
			ext: 'xml',
			mime: 'application/xml'
		};
	}

	if (check([0x42, 0x4F, 0x4F, 0x4B, 0x4D, 0x4F, 0x42, 0x49], {offset: 60})) {
		return {
			ext: 'mobi',
			mime: 'application/x-mobipocket-ebook'
		};
	}

	// File Type Box (https://en.wikipedia.org/wiki/ISO_base_media_file_format)
	if (check([0x66, 0x74, 0x79, 0x70], {offset: 4})) {
		if (check([0x6D, 0x69, 0x66, 0x31], {offset: 8})) {
			return {
				ext: 'heic',
				mime: 'image/heif'
			};
		}

		if (check([0x6D, 0x73, 0x66, 0x31], {offset: 8})) {
			return {
				ext: 'heic',
				mime: 'image/heif-sequence'
			};
		}

		if (check([0x68, 0x65, 0x69, 0x63], {offset: 8}) || check([0x68, 0x65, 0x69, 0x78], {offset: 8})) {
			return {
				ext: 'heic',
				mime: 'image/heic'
			};
		}

		if (check([0x68, 0x65, 0x76, 0x63], {offset: 8}) || check([0x68, 0x65, 0x76, 0x78], {offset: 8})) {
			return {
				ext: 'heic',
				mime: 'image/heic-sequence'
			};
		}
	}

	if (check([0xAB, 0x4B, 0x54, 0x58, 0x20, 0x31, 0x31, 0xBB, 0x0D, 0x0A, 0x1A, 0x0A])) {
		return {
			ext: 'ktx',
			mime: 'image/ktx'
		};
	}

	return null;
};

var extName$1 = {exports: {}};

var require$$0$1 = {
	"application/1d-interleaved-parityfec": {
	source: "iana"
},
	"application/3gpdash-qoe-report+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/3gpp-ims+xml": {
	source: "iana",
	compressible: true
},
	"application/3gpphal+json": {
	source: "iana",
	compressible: true
},
	"application/3gpphalforms+json": {
	source: "iana",
	compressible: true
},
	"application/a2l": {
	source: "iana"
},
	"application/ace+cbor": {
	source: "iana"
},
	"application/ace+json": {
	source: "iana",
	compressible: true
},
	"application/ace-groupcomm+cbor": {
	source: "iana"
},
	"application/activemessage": {
	source: "iana"
},
	"application/activity+json": {
	source: "iana",
	compressible: true
},
	"application/aif+cbor": {
	source: "iana"
},
	"application/aif+json": {
	source: "iana",
	compressible: true
},
	"application/alto-cdni+json": {
	source: "iana",
	compressible: true
},
	"application/alto-cdnifilter+json": {
	source: "iana",
	compressible: true
},
	"application/alto-costmap+json": {
	source: "iana",
	compressible: true
},
	"application/alto-costmapfilter+json": {
	source: "iana",
	compressible: true
},
	"application/alto-directory+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointcost+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointcostparams+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointprop+json": {
	source: "iana",
	compressible: true
},
	"application/alto-endpointpropparams+json": {
	source: "iana",
	compressible: true
},
	"application/alto-error+json": {
	source: "iana",
	compressible: true
},
	"application/alto-networkmap+json": {
	source: "iana",
	compressible: true
},
	"application/alto-networkmapfilter+json": {
	source: "iana",
	compressible: true
},
	"application/alto-propmap+json": {
	source: "iana",
	compressible: true
},
	"application/alto-propmapparams+json": {
	source: "iana",
	compressible: true
},
	"application/alto-tips+json": {
	source: "iana",
	compressible: true
},
	"application/alto-tipsparams+json": {
	source: "iana",
	compressible: true
},
	"application/alto-updatestreamcontrol+json": {
	source: "iana",
	compressible: true
},
	"application/alto-updatestreamparams+json": {
	source: "iana",
	compressible: true
},
	"application/aml": {
	source: "iana"
},
	"application/andrew-inset": {
	source: "iana",
	extensions: [
		"ez"
	]
},
	"application/appinstaller": {
	compressible: false,
	extensions: [
		"appinstaller"
	]
},
	"application/applefile": {
	source: "iana"
},
	"application/applixware": {
	source: "apache",
	extensions: [
		"aw"
	]
},
	"application/appx": {
	compressible: false,
	extensions: [
		"appx"
	]
},
	"application/appxbundle": {
	compressible: false,
	extensions: [
		"appxbundle"
	]
},
	"application/at+jwt": {
	source: "iana"
},
	"application/atf": {
	source: "iana"
},
	"application/atfx": {
	source: "iana"
},
	"application/atom+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atom"
	]
},
	"application/atomcat+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atomcat"
	]
},
	"application/atomdeleted+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atomdeleted"
	]
},
	"application/atomicmail": {
	source: "iana"
},
	"application/atomsvc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"atomsvc"
	]
},
	"application/atsc-dwd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"dwd"
	]
},
	"application/atsc-dynamic-event-message": {
	source: "iana"
},
	"application/atsc-held+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"held"
	]
},
	"application/atsc-rdt+json": {
	source: "iana",
	compressible: true
},
	"application/atsc-rsat+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rsat"
	]
},
	"application/atxml": {
	source: "iana"
},
	"application/auth-policy+xml": {
	source: "iana",
	compressible: true
},
	"application/automationml-aml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"aml"
	]
},
	"application/automationml-amlx+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"amlx"
	]
},
	"application/bacnet-xdd+zip": {
	source: "iana",
	compressible: false
},
	"application/batch-smtp": {
	source: "iana"
},
	"application/bdoc": {
	compressible: false,
	extensions: [
		"bdoc"
	]
},
	"application/beep+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/bufr": {
	source: "iana"
},
	"application/c2pa": {
	source: "iana"
},
	"application/calendar+json": {
	source: "iana",
	compressible: true
},
	"application/calendar+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xcs"
	]
},
	"application/call-completion": {
	source: "iana"
},
	"application/cals-1840": {
	source: "iana"
},
	"application/captive+json": {
	source: "iana",
	compressible: true
},
	"application/cbor": {
	source: "iana"
},
	"application/cbor-seq": {
	source: "iana"
},
	"application/cccex": {
	source: "iana"
},
	"application/ccmp+xml": {
	source: "iana",
	compressible: true
},
	"application/ccxml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ccxml"
	]
},
	"application/cda+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/cdfx+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"cdfx"
	]
},
	"application/cdmi-capability": {
	source: "iana",
	extensions: [
		"cdmia"
	]
},
	"application/cdmi-container": {
	source: "iana",
	extensions: [
		"cdmic"
	]
},
	"application/cdmi-domain": {
	source: "iana",
	extensions: [
		"cdmid"
	]
},
	"application/cdmi-object": {
	source: "iana",
	extensions: [
		"cdmio"
	]
},
	"application/cdmi-queue": {
	source: "iana",
	extensions: [
		"cdmiq"
	]
},
	"application/cdni": {
	source: "iana"
},
	"application/cea": {
	source: "iana"
},
	"application/cea-2018+xml": {
	source: "iana",
	compressible: true
},
	"application/cellml+xml": {
	source: "iana",
	compressible: true
},
	"application/cfw": {
	source: "iana"
},
	"application/cid-edhoc+cbor-seq": {
	source: "iana"
},
	"application/city+json": {
	source: "iana",
	compressible: true
},
	"application/clr": {
	source: "iana"
},
	"application/clue+xml": {
	source: "iana",
	compressible: true
},
	"application/clue_info+xml": {
	source: "iana",
	compressible: true
},
	"application/cms": {
	source: "iana"
},
	"application/cnrp+xml": {
	source: "iana",
	compressible: true
},
	"application/coap-group+json": {
	source: "iana",
	compressible: true
},
	"application/coap-payload": {
	source: "iana"
},
	"application/commonground": {
	source: "iana"
},
	"application/concise-problem-details+cbor": {
	source: "iana"
},
	"application/conference-info+xml": {
	source: "iana",
	compressible: true
},
	"application/cose": {
	source: "iana"
},
	"application/cose-key": {
	source: "iana"
},
	"application/cose-key-set": {
	source: "iana"
},
	"application/cose-x509": {
	source: "iana"
},
	"application/cpl+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"cpl"
	]
},
	"application/csrattrs": {
	source: "iana"
},
	"application/csta+xml": {
	source: "iana",
	compressible: true
},
	"application/cstadata+xml": {
	source: "iana",
	compressible: true
},
	"application/csvm+json": {
	source: "iana",
	compressible: true
},
	"application/cu-seeme": {
	source: "apache",
	extensions: [
		"cu"
	]
},
	"application/cwl": {
	source: "iana",
	extensions: [
		"cwl"
	]
},
	"application/cwl+json": {
	source: "iana",
	compressible: true
},
	"application/cwl+yaml": {
	source: "iana"
},
	"application/cwt": {
	source: "iana"
},
	"application/cybercash": {
	source: "iana"
},
	"application/dart": {
	compressible: true
},
	"application/dash+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpd"
	]
},
	"application/dash-patch+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpp"
	]
},
	"application/dashdelta": {
	source: "iana"
},
	"application/davmount+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"davmount"
	]
},
	"application/dca-rft": {
	source: "iana"
},
	"application/dcd": {
	source: "iana"
},
	"application/dec-dx": {
	source: "iana"
},
	"application/dialog-info+xml": {
	source: "iana",
	compressible: true
},
	"application/dicom": {
	source: "iana"
},
	"application/dicom+json": {
	source: "iana",
	compressible: true
},
	"application/dicom+xml": {
	source: "iana",
	compressible: true
},
	"application/dii": {
	source: "iana"
},
	"application/dit": {
	source: "iana"
},
	"application/dns": {
	source: "iana"
},
	"application/dns+json": {
	source: "iana",
	compressible: true
},
	"application/dns-message": {
	source: "iana"
},
	"application/docbook+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"dbk"
	]
},
	"application/dots+cbor": {
	source: "iana"
},
	"application/dpop+jwt": {
	source: "iana"
},
	"application/dskpp+xml": {
	source: "iana",
	compressible: true
},
	"application/dssc+der": {
	source: "iana",
	extensions: [
		"dssc"
	]
},
	"application/dssc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xdssc"
	]
},
	"application/dvcs": {
	source: "iana"
},
	"application/ecmascript": {
	source: "apache",
	compressible: true,
	extensions: [
		"ecma"
	]
},
	"application/edhoc+cbor-seq": {
	source: "iana"
},
	"application/edi-consent": {
	source: "iana"
},
	"application/edi-x12": {
	source: "iana",
	compressible: false
},
	"application/edifact": {
	source: "iana",
	compressible: false
},
	"application/efi": {
	source: "iana"
},
	"application/elm+json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/elm+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.cap+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/emergencycalldata.comment+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.control+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.deviceinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.ecall.msd": {
	source: "iana"
},
	"application/emergencycalldata.legacyesn+json": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.providerinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.serviceinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.subscriberinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/emergencycalldata.veds+xml": {
	source: "iana",
	compressible: true
},
	"application/emma+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"emma"
	]
},
	"application/emotionml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"emotionml"
	]
},
	"application/encaprtp": {
	source: "iana"
},
	"application/epp+xml": {
	source: "iana",
	compressible: true
},
	"application/epub+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"epub"
	]
},
	"application/eshop": {
	source: "iana"
},
	"application/exi": {
	source: "iana",
	extensions: [
		"exi"
	]
},
	"application/expect-ct-report+json": {
	source: "iana",
	compressible: true
},
	"application/express": {
	source: "iana",
	extensions: [
		"exp"
	]
},
	"application/fastinfoset": {
	source: "iana"
},
	"application/fastsoap": {
	source: "iana"
},
	"application/fdf": {
	source: "iana",
	extensions: [
		"fdf"
	]
},
	"application/fdt+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"fdt"
	]
},
	"application/fhir+json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/fhir+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/fido.trusted-apps+json": {
	compressible: true
},
	"application/fits": {
	source: "iana"
},
	"application/flexfec": {
	source: "iana"
},
	"application/font-sfnt": {
	source: "iana"
},
	"application/font-tdpfr": {
	source: "iana",
	extensions: [
		"pfr"
	]
},
	"application/font-woff": {
	source: "iana",
	compressible: false
},
	"application/framework-attributes+xml": {
	source: "iana",
	compressible: true
},
	"application/geo+json": {
	source: "iana",
	compressible: true,
	extensions: [
		"geojson"
	]
},
	"application/geo+json-seq": {
	source: "iana"
},
	"application/geopackage+sqlite3": {
	source: "iana"
},
	"application/geoxacml+json": {
	source: "iana",
	compressible: true
},
	"application/geoxacml+xml": {
	source: "iana",
	compressible: true
},
	"application/gltf-buffer": {
	source: "iana"
},
	"application/gml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"gml"
	]
},
	"application/gnap-binding-jws": {
	source: "iana"
},
	"application/gnap-binding-jwsd": {
	source: "iana"
},
	"application/gnap-binding-rotation-jws": {
	source: "iana"
},
	"application/gnap-binding-rotation-jwsd": {
	source: "iana"
},
	"application/gpx+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"gpx"
	]
},
	"application/grib": {
	source: "iana"
},
	"application/gxf": {
	source: "apache",
	extensions: [
		"gxf"
	]
},
	"application/gzip": {
	source: "iana",
	compressible: false,
	extensions: [
		"gz"
	]
},
	"application/h224": {
	source: "iana"
},
	"application/held+xml": {
	source: "iana",
	compressible: true
},
	"application/hjson": {
	extensions: [
		"hjson"
	]
},
	"application/hl7v2+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/http": {
	source: "iana"
},
	"application/hyperstudio": {
	source: "iana",
	extensions: [
		"stk"
	]
},
	"application/ibe-key-request+xml": {
	source: "iana",
	compressible: true
},
	"application/ibe-pkg-reply+xml": {
	source: "iana",
	compressible: true
},
	"application/ibe-pp-data": {
	source: "iana"
},
	"application/iges": {
	source: "iana"
},
	"application/im-iscomposing+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/index": {
	source: "iana"
},
	"application/index.cmd": {
	source: "iana"
},
	"application/index.obj": {
	source: "iana"
},
	"application/index.response": {
	source: "iana"
},
	"application/index.vnd": {
	source: "iana"
},
	"application/inkml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ink",
		"inkml"
	]
},
	"application/iotp": {
	source: "iana"
},
	"application/ipfix": {
	source: "iana",
	extensions: [
		"ipfix"
	]
},
	"application/ipp": {
	source: "iana"
},
	"application/isup": {
	source: "iana"
},
	"application/its+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"its"
	]
},
	"application/java-archive": {
	source: "iana",
	compressible: false,
	extensions: [
		"jar",
		"war",
		"ear"
	]
},
	"application/java-serialized-object": {
	source: "apache",
	compressible: false,
	extensions: [
		"ser"
	]
},
	"application/java-vm": {
	source: "apache",
	compressible: false,
	extensions: [
		"class"
	]
},
	"application/javascript": {
	source: "apache",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"js"
	]
},
	"application/jf2feed+json": {
	source: "iana",
	compressible: true
},
	"application/jose": {
	source: "iana"
},
	"application/jose+json": {
	source: "iana",
	compressible: true
},
	"application/jrd+json": {
	source: "iana",
	compressible: true
},
	"application/jscalendar+json": {
	source: "iana",
	compressible: true
},
	"application/jscontact+json": {
	source: "iana",
	compressible: true
},
	"application/json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"json",
		"map"
	]
},
	"application/json-patch+json": {
	source: "iana",
	compressible: true
},
	"application/json-seq": {
	source: "iana"
},
	"application/json5": {
	extensions: [
		"json5"
	]
},
	"application/jsonml+json": {
	source: "apache",
	compressible: true,
	extensions: [
		"jsonml"
	]
},
	"application/jsonpath": {
	source: "iana"
},
	"application/jwk+json": {
	source: "iana",
	compressible: true
},
	"application/jwk-set+json": {
	source: "iana",
	compressible: true
},
	"application/jwt": {
	source: "iana"
},
	"application/kpml-request+xml": {
	source: "iana",
	compressible: true
},
	"application/kpml-response+xml": {
	source: "iana",
	compressible: true
},
	"application/ld+json": {
	source: "iana",
	compressible: true,
	extensions: [
		"jsonld"
	]
},
	"application/lgr+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lgr"
	]
},
	"application/link-format": {
	source: "iana"
},
	"application/linkset": {
	source: "iana"
},
	"application/linkset+json": {
	source: "iana",
	compressible: true
},
	"application/load-control+xml": {
	source: "iana",
	compressible: true
},
	"application/logout+jwt": {
	source: "iana"
},
	"application/lost+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lostxml"
	]
},
	"application/lostsync+xml": {
	source: "iana",
	compressible: true
},
	"application/lpf+zip": {
	source: "iana",
	compressible: false
},
	"application/lxf": {
	source: "iana"
},
	"application/mac-binhex40": {
	source: "iana",
	extensions: [
		"hqx"
	]
},
	"application/mac-compactpro": {
	source: "apache",
	extensions: [
		"cpt"
	]
},
	"application/macwriteii": {
	source: "iana"
},
	"application/mads+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mads"
	]
},
	"application/manifest+json": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"webmanifest"
	]
},
	"application/marc": {
	source: "iana",
	extensions: [
		"mrc"
	]
},
	"application/marcxml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mrcx"
	]
},
	"application/mathematica": {
	source: "iana",
	extensions: [
		"ma",
		"nb",
		"mb"
	]
},
	"application/mathml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mathml"
	]
},
	"application/mathml-content+xml": {
	source: "iana",
	compressible: true
},
	"application/mathml-presentation+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-associated-procedure-description+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-deregister+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-envelope+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-msk+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-msk-response+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-protection-description+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-reception-report+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-register+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-register-response+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-schedule+xml": {
	source: "iana",
	compressible: true
},
	"application/mbms-user-service-description+xml": {
	source: "iana",
	compressible: true
},
	"application/mbox": {
	source: "iana",
	extensions: [
		"mbox"
	]
},
	"application/media-policy-dataset+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpf"
	]
},
	"application/media_control+xml": {
	source: "iana",
	compressible: true
},
	"application/mediaservercontrol+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mscml"
	]
},
	"application/merge-patch+json": {
	source: "iana",
	compressible: true
},
	"application/metalink+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"metalink"
	]
},
	"application/metalink4+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"meta4"
	]
},
	"application/mets+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mets"
	]
},
	"application/mf4": {
	source: "iana"
},
	"application/mikey": {
	source: "iana"
},
	"application/mipc": {
	source: "iana"
},
	"application/missing-blocks+cbor-seq": {
	source: "iana"
},
	"application/mmt-aei+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"maei"
	]
},
	"application/mmt-usd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"musd"
	]
},
	"application/mods+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mods"
	]
},
	"application/moss-keys": {
	source: "iana"
},
	"application/moss-signature": {
	source: "iana"
},
	"application/mosskey-data": {
	source: "iana"
},
	"application/mosskey-request": {
	source: "iana"
},
	"application/mp21": {
	source: "iana",
	extensions: [
		"m21",
		"mp21"
	]
},
	"application/mp4": {
	source: "iana",
	extensions: [
		"mp4",
		"mpg4",
		"mp4s",
		"m4p"
	]
},
	"application/mpeg4-generic": {
	source: "iana"
},
	"application/mpeg4-iod": {
	source: "iana"
},
	"application/mpeg4-iod-xmt": {
	source: "iana"
},
	"application/mrb-consumer+xml": {
	source: "iana",
	compressible: true
},
	"application/mrb-publish+xml": {
	source: "iana",
	compressible: true
},
	"application/msc-ivr+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/msc-mixer+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/msix": {
	compressible: false,
	extensions: [
		"msix"
	]
},
	"application/msixbundle": {
	compressible: false,
	extensions: [
		"msixbundle"
	]
},
	"application/msword": {
	source: "iana",
	compressible: false,
	extensions: [
		"doc",
		"dot"
	]
},
	"application/mud+json": {
	source: "iana",
	compressible: true
},
	"application/multipart-core": {
	source: "iana"
},
	"application/mxf": {
	source: "iana",
	extensions: [
		"mxf"
	]
},
	"application/n-quads": {
	source: "iana",
	extensions: [
		"nq"
	]
},
	"application/n-triples": {
	source: "iana",
	extensions: [
		"nt"
	]
},
	"application/nasdata": {
	source: "iana"
},
	"application/news-checkgroups": {
	source: "iana",
	charset: "US-ASCII"
},
	"application/news-groupinfo": {
	source: "iana",
	charset: "US-ASCII"
},
	"application/news-transmission": {
	source: "iana"
},
	"application/nlsml+xml": {
	source: "iana",
	compressible: true
},
	"application/node": {
	source: "iana",
	extensions: [
		"cjs"
	]
},
	"application/nss": {
	source: "iana"
},
	"application/oauth-authz-req+jwt": {
	source: "iana"
},
	"application/oblivious-dns-message": {
	source: "iana"
},
	"application/ocsp-request": {
	source: "iana"
},
	"application/ocsp-response": {
	source: "iana"
},
	"application/octet-stream": {
	source: "iana",
	compressible: false,
	extensions: [
		"bin",
		"dms",
		"lrf",
		"mar",
		"so",
		"dist",
		"distz",
		"pkg",
		"bpk",
		"dump",
		"elc",
		"deploy",
		"exe",
		"dll",
		"deb",
		"dmg",
		"iso",
		"img",
		"msi",
		"msp",
		"msm",
		"buffer"
	]
},
	"application/oda": {
	source: "iana",
	extensions: [
		"oda"
	]
},
	"application/odm+xml": {
	source: "iana",
	compressible: true
},
	"application/odx": {
	source: "iana"
},
	"application/oebps-package+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"opf"
	]
},
	"application/ogg": {
	source: "iana",
	compressible: false,
	extensions: [
		"ogx"
	]
},
	"application/ohttp-keys": {
	source: "iana"
},
	"application/omdoc+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"omdoc"
	]
},
	"application/onenote": {
	source: "apache",
	extensions: [
		"onetoc",
		"onetoc2",
		"onetmp",
		"onepkg"
	]
},
	"application/opc-nodeset+xml": {
	source: "iana",
	compressible: true
},
	"application/oscore": {
	source: "iana"
},
	"application/oxps": {
	source: "iana",
	extensions: [
		"oxps"
	]
},
	"application/p21": {
	source: "iana"
},
	"application/p21+zip": {
	source: "iana",
	compressible: false
},
	"application/p2p-overlay+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"relo"
	]
},
	"application/parityfec": {
	source: "iana"
},
	"application/passport": {
	source: "iana"
},
	"application/patch-ops-error+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xer"
	]
},
	"application/pdf": {
	source: "iana",
	compressible: false,
	extensions: [
		"pdf"
	]
},
	"application/pdx": {
	source: "iana"
},
	"application/pem-certificate-chain": {
	source: "iana"
},
	"application/pgp-encrypted": {
	source: "iana",
	compressible: false,
	extensions: [
		"pgp"
	]
},
	"application/pgp-keys": {
	source: "iana",
	extensions: [
		"asc"
	]
},
	"application/pgp-signature": {
	source: "iana",
	extensions: [
		"sig",
		"asc"
	]
},
	"application/pics-rules": {
	source: "apache",
	extensions: [
		"prf"
	]
},
	"application/pidf+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/pidf-diff+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/pkcs10": {
	source: "iana",
	extensions: [
		"p10"
	]
},
	"application/pkcs12": {
	source: "iana"
},
	"application/pkcs7-mime": {
	source: "iana",
	extensions: [
		"p7m",
		"p7c"
	]
},
	"application/pkcs7-signature": {
	source: "iana",
	extensions: [
		"p7s"
	]
},
	"application/pkcs8": {
	source: "iana",
	extensions: [
		"p8"
	]
},
	"application/pkcs8-encrypted": {
	source: "iana"
},
	"application/pkix-attr-cert": {
	source: "iana",
	extensions: [
		"ac"
	]
},
	"application/pkix-cert": {
	source: "iana",
	extensions: [
		"cer"
	]
},
	"application/pkix-crl": {
	source: "iana",
	extensions: [
		"crl"
	]
},
	"application/pkix-pkipath": {
	source: "iana",
	extensions: [
		"pkipath"
	]
},
	"application/pkixcmp": {
	source: "iana",
	extensions: [
		"pki"
	]
},
	"application/pls+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"pls"
	]
},
	"application/poc-settings+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/postscript": {
	source: "iana",
	compressible: true,
	extensions: [
		"ai",
		"eps",
		"ps"
	]
},
	"application/ppsp-tracker+json": {
	source: "iana",
	compressible: true
},
	"application/private-token-issuer-directory": {
	source: "iana"
},
	"application/private-token-request": {
	source: "iana"
},
	"application/private-token-response": {
	source: "iana"
},
	"application/problem+json": {
	source: "iana",
	compressible: true
},
	"application/problem+xml": {
	source: "iana",
	compressible: true
},
	"application/provenance+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"provx"
	]
},
	"application/prs.alvestrand.titrax-sheet": {
	source: "iana"
},
	"application/prs.cww": {
	source: "iana",
	extensions: [
		"cww"
	]
},
	"application/prs.cyn": {
	source: "iana",
	charset: "7-BIT"
},
	"application/prs.hpub+zip": {
	source: "iana",
	compressible: false
},
	"application/prs.implied-document+xml": {
	source: "iana",
	compressible: true
},
	"application/prs.implied-executable": {
	source: "iana"
},
	"application/prs.implied-object+json": {
	source: "iana",
	compressible: true
},
	"application/prs.implied-object+json-seq": {
	source: "iana"
},
	"application/prs.implied-object+yaml": {
	source: "iana"
},
	"application/prs.implied-structure": {
	source: "iana"
},
	"application/prs.nprend": {
	source: "iana"
},
	"application/prs.plucker": {
	source: "iana"
},
	"application/prs.rdf-xml-crypt": {
	source: "iana"
},
	"application/prs.vcfbzip2": {
	source: "iana"
},
	"application/prs.xsf+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xsf"
	]
},
	"application/pskc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"pskcxml"
	]
},
	"application/pvd+json": {
	source: "iana",
	compressible: true
},
	"application/qsig": {
	source: "iana"
},
	"application/raml+yaml": {
	compressible: true,
	extensions: [
		"raml"
	]
},
	"application/raptorfec": {
	source: "iana"
},
	"application/rdap+json": {
	source: "iana",
	compressible: true
},
	"application/rdf+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rdf",
		"owl"
	]
},
	"application/reginfo+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rif"
	]
},
	"application/relax-ng-compact-syntax": {
	source: "iana",
	extensions: [
		"rnc"
	]
},
	"application/remote-printing": {
	source: "apache"
},
	"application/reputon+json": {
	source: "iana",
	compressible: true
},
	"application/resource-lists+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rl"
	]
},
	"application/resource-lists-diff+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rld"
	]
},
	"application/rfc+xml": {
	source: "iana",
	compressible: true
},
	"application/riscos": {
	source: "iana"
},
	"application/rlmi+xml": {
	source: "iana",
	compressible: true
},
	"application/rls-services+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rs"
	]
},
	"application/route-apd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rapd"
	]
},
	"application/route-s-tsid+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sls"
	]
},
	"application/route-usd+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rusd"
	]
},
	"application/rpki-checklist": {
	source: "iana"
},
	"application/rpki-ghostbusters": {
	source: "iana",
	extensions: [
		"gbr"
	]
},
	"application/rpki-manifest": {
	source: "iana",
	extensions: [
		"mft"
	]
},
	"application/rpki-publication": {
	source: "iana"
},
	"application/rpki-roa": {
	source: "iana",
	extensions: [
		"roa"
	]
},
	"application/rpki-signed-tal": {
	source: "iana"
},
	"application/rpki-updown": {
	source: "iana"
},
	"application/rsd+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"rsd"
	]
},
	"application/rss+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"rss"
	]
},
	"application/rtf": {
	source: "iana",
	compressible: true,
	extensions: [
		"rtf"
	]
},
	"application/rtploopback": {
	source: "iana"
},
	"application/rtx": {
	source: "iana"
},
	"application/samlassertion+xml": {
	source: "iana",
	compressible: true
},
	"application/samlmetadata+xml": {
	source: "iana",
	compressible: true
},
	"application/sarif+json": {
	source: "iana",
	compressible: true
},
	"application/sarif-external-properties+json": {
	source: "iana",
	compressible: true
},
	"application/sbe": {
	source: "iana"
},
	"application/sbml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sbml"
	]
},
	"application/scaip+xml": {
	source: "iana",
	compressible: true
},
	"application/scim+json": {
	source: "iana",
	compressible: true
},
	"application/scvp-cv-request": {
	source: "iana",
	extensions: [
		"scq"
	]
},
	"application/scvp-cv-response": {
	source: "iana",
	extensions: [
		"scs"
	]
},
	"application/scvp-vp-request": {
	source: "iana",
	extensions: [
		"spq"
	]
},
	"application/scvp-vp-response": {
	source: "iana",
	extensions: [
		"spp"
	]
},
	"application/sdp": {
	source: "iana",
	extensions: [
		"sdp"
	]
},
	"application/secevent+jwt": {
	source: "iana"
},
	"application/senml+cbor": {
	source: "iana"
},
	"application/senml+json": {
	source: "iana",
	compressible: true
},
	"application/senml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"senmlx"
	]
},
	"application/senml-etch+cbor": {
	source: "iana"
},
	"application/senml-etch+json": {
	source: "iana",
	compressible: true
},
	"application/senml-exi": {
	source: "iana"
},
	"application/sensml+cbor": {
	source: "iana"
},
	"application/sensml+json": {
	source: "iana",
	compressible: true
},
	"application/sensml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sensmlx"
	]
},
	"application/sensml-exi": {
	source: "iana"
},
	"application/sep+xml": {
	source: "iana",
	compressible: true
},
	"application/sep-exi": {
	source: "iana"
},
	"application/session-info": {
	source: "iana"
},
	"application/set-payment": {
	source: "iana"
},
	"application/set-payment-initiation": {
	source: "iana",
	extensions: [
		"setpay"
	]
},
	"application/set-registration": {
	source: "iana"
},
	"application/set-registration-initiation": {
	source: "iana",
	extensions: [
		"setreg"
	]
},
	"application/sgml": {
	source: "iana"
},
	"application/sgml-open-catalog": {
	source: "iana"
},
	"application/shf+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"shf"
	]
},
	"application/sieve": {
	source: "iana",
	extensions: [
		"siv",
		"sieve"
	]
},
	"application/simple-filter+xml": {
	source: "iana",
	compressible: true
},
	"application/simple-message-summary": {
	source: "iana"
},
	"application/simplesymbolcontainer": {
	source: "iana"
},
	"application/sipc": {
	source: "iana"
},
	"application/slate": {
	source: "iana"
},
	"application/smil": {
	source: "apache"
},
	"application/smil+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"smi",
		"smil"
	]
},
	"application/smpte336m": {
	source: "iana"
},
	"application/soap+fastinfoset": {
	source: "iana"
},
	"application/soap+xml": {
	source: "iana",
	compressible: true
},
	"application/sparql-query": {
	source: "iana",
	extensions: [
		"rq"
	]
},
	"application/sparql-results+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"srx"
	]
},
	"application/spdx+json": {
	source: "iana",
	compressible: true
},
	"application/spirits-event+xml": {
	source: "iana",
	compressible: true
},
	"application/sql": {
	source: "iana",
	extensions: [
		"sql"
	]
},
	"application/srgs": {
	source: "iana",
	extensions: [
		"gram"
	]
},
	"application/srgs+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"grxml"
	]
},
	"application/sru+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sru"
	]
},
	"application/ssdl+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"ssdl"
	]
},
	"application/ssml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ssml"
	]
},
	"application/st2110-41": {
	source: "iana"
},
	"application/stix+json": {
	source: "iana",
	compressible: true
},
	"application/stratum": {
	source: "iana"
},
	"application/swid+cbor": {
	source: "iana"
},
	"application/swid+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"swidtag"
	]
},
	"application/tamp-apex-update": {
	source: "iana"
},
	"application/tamp-apex-update-confirm": {
	source: "iana"
},
	"application/tamp-community-update": {
	source: "iana"
},
	"application/tamp-community-update-confirm": {
	source: "iana"
},
	"application/tamp-error": {
	source: "iana"
},
	"application/tamp-sequence-adjust": {
	source: "iana"
},
	"application/tamp-sequence-adjust-confirm": {
	source: "iana"
},
	"application/tamp-status-query": {
	source: "iana"
},
	"application/tamp-status-response": {
	source: "iana"
},
	"application/tamp-update": {
	source: "iana"
},
	"application/tamp-update-confirm": {
	source: "iana"
},
	"application/tar": {
	compressible: true
},
	"application/taxii+json": {
	source: "iana",
	compressible: true
},
	"application/td+json": {
	source: "iana",
	compressible: true
},
	"application/tei+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"tei",
		"teicorpus"
	]
},
	"application/tetra_isi": {
	source: "iana"
},
	"application/thraud+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"tfi"
	]
},
	"application/timestamp-query": {
	source: "iana"
},
	"application/timestamp-reply": {
	source: "iana"
},
	"application/timestamped-data": {
	source: "iana",
	extensions: [
		"tsd"
	]
},
	"application/tlsrpt+gzip": {
	source: "iana"
},
	"application/tlsrpt+json": {
	source: "iana",
	compressible: true
},
	"application/tm+json": {
	source: "iana",
	compressible: true
},
	"application/tnauthlist": {
	source: "iana"
},
	"application/token-introspection+jwt": {
	source: "iana"
},
	"application/toml": {
	compressible: true,
	extensions: [
		"toml"
	]
},
	"application/trickle-ice-sdpfrag": {
	source: "iana"
},
	"application/trig": {
	source: "iana",
	extensions: [
		"trig"
	]
},
	"application/ttml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ttml"
	]
},
	"application/tve-trigger": {
	source: "iana"
},
	"application/tzif": {
	source: "iana"
},
	"application/tzif-leap": {
	source: "iana"
},
	"application/ubjson": {
	compressible: false,
	extensions: [
		"ubj"
	]
},
	"application/ulpfec": {
	source: "iana"
},
	"application/urc-grpsheet+xml": {
	source: "iana",
	compressible: true
},
	"application/urc-ressheet+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"rsheet"
	]
},
	"application/urc-targetdesc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"td"
	]
},
	"application/urc-uisocketdesc+xml": {
	source: "iana",
	compressible: true
},
	"application/vc": {
	source: "iana"
},
	"application/vcard+json": {
	source: "iana",
	compressible: true
},
	"application/vcard+xml": {
	source: "iana",
	compressible: true
},
	"application/vemmi": {
	source: "iana"
},
	"application/vividence.scriptfile": {
	source: "apache"
},
	"application/vnd.1000minds.decision-model+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"1km"
	]
},
	"application/vnd.1ob": {
	source: "iana"
},
	"application/vnd.3gpp-prose+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp-prose-pc3a+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp-prose-pc3ach+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp-prose-pc3ch+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp-prose-pc8+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp-v2x-local-service-information": {
	source: "iana"
},
	"application/vnd.3gpp.5gnas": {
	source: "iana"
},
	"application/vnd.3gpp.5gsa2x": {
	source: "iana"
},
	"application/vnd.3gpp.5gsa2x-local-service-information": {
	source: "iana"
},
	"application/vnd.3gpp.access-transfer-events+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.bsf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.crs+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.current-location-discovery+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.gmop+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.gtpc": {
	source: "iana"
},
	"application/vnd.3gpp.interworking-data": {
	source: "iana"
},
	"application/vnd.3gpp.lpp": {
	source: "iana"
},
	"application/vnd.3gpp.mc-signalling-ear": {
	source: "iana"
},
	"application/vnd.3gpp.mcdata-affiliation-command+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-msgstore-ctrl-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-payload": {
	source: "iana"
},
	"application/vnd.3gpp.mcdata-regroup+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-service-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-signalling": {
	source: "iana"
},
	"application/vnd.3gpp.mcdata-ue-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcdata-user-profile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-affiliation-command+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-floor-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-location-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-regroup+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-service-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-signed+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-ue-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-ue-init-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcptt-user-profile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-affiliation-command+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-location-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-regroup+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-service-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-transmission-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-ue-config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mcvideo-user-profile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.mid-call+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.ngap": {
	source: "iana"
},
	"application/vnd.3gpp.pfcp": {
	source: "iana"
},
	"application/vnd.3gpp.pic-bw-large": {
	source: "iana",
	extensions: [
		"plb"
	]
},
	"application/vnd.3gpp.pic-bw-small": {
	source: "iana",
	extensions: [
		"psb"
	]
},
	"application/vnd.3gpp.pic-bw-var": {
	source: "iana",
	extensions: [
		"pvb"
	]
},
	"application/vnd.3gpp.pinapp-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.s1ap": {
	source: "iana"
},
	"application/vnd.3gpp.seal-group-doc+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.seal-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.seal-location-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.seal-mbms-usage-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.seal-network-qos-management-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.seal-ue-config-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.seal-unicast-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.seal-user-profile-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.sms": {
	source: "iana"
},
	"application/vnd.3gpp.sms+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.srvcc-ext+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.srvcc-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.state-and-event-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.ussd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp.v2x": {
	source: "iana"
},
	"application/vnd.3gpp.vae-info+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp2.bcmcsinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.3gpp2.sms": {
	source: "iana"
},
	"application/vnd.3gpp2.tcap": {
	source: "iana",
	extensions: [
		"tcap"
	]
},
	"application/vnd.3lightssoftware.imagescal": {
	source: "iana"
},
	"application/vnd.3m.post-it-notes": {
	source: "iana",
	extensions: [
		"pwn"
	]
},
	"application/vnd.accpac.simply.aso": {
	source: "iana",
	extensions: [
		"aso"
	]
},
	"application/vnd.accpac.simply.imp": {
	source: "iana",
	extensions: [
		"imp"
	]
},
	"application/vnd.acm.addressxfer+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.acm.chatbot+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.acucobol": {
	source: "iana",
	extensions: [
		"acu"
	]
},
	"application/vnd.acucorp": {
	source: "iana",
	extensions: [
		"atc",
		"acutc"
	]
},
	"application/vnd.adobe.air-application-installer-package+zip": {
	source: "apache",
	compressible: false,
	extensions: [
		"air"
	]
},
	"application/vnd.adobe.flash.movie": {
	source: "iana"
},
	"application/vnd.adobe.formscentral.fcdt": {
	source: "iana",
	extensions: [
		"fcdt"
	]
},
	"application/vnd.adobe.fxp": {
	source: "iana",
	extensions: [
		"fxp",
		"fxpl"
	]
},
	"application/vnd.adobe.partial-upload": {
	source: "iana"
},
	"application/vnd.adobe.xdp+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xdp"
	]
},
	"application/vnd.adobe.xfdf": {
	source: "apache",
	extensions: [
		"xfdf"
	]
},
	"application/vnd.aether.imp": {
	source: "iana"
},
	"application/vnd.afpc.afplinedata": {
	source: "iana"
},
	"application/vnd.afpc.afplinedata-pagedef": {
	source: "iana"
},
	"application/vnd.afpc.cmoca-cmresource": {
	source: "iana"
},
	"application/vnd.afpc.foca-charset": {
	source: "iana"
},
	"application/vnd.afpc.foca-codedfont": {
	source: "iana"
},
	"application/vnd.afpc.foca-codepage": {
	source: "iana"
},
	"application/vnd.afpc.modca": {
	source: "iana"
},
	"application/vnd.afpc.modca-cmtable": {
	source: "iana"
},
	"application/vnd.afpc.modca-formdef": {
	source: "iana"
},
	"application/vnd.afpc.modca-mediummap": {
	source: "iana"
},
	"application/vnd.afpc.modca-objectcontainer": {
	source: "iana"
},
	"application/vnd.afpc.modca-overlay": {
	source: "iana"
},
	"application/vnd.afpc.modca-pagesegment": {
	source: "iana"
},
	"application/vnd.age": {
	source: "iana",
	extensions: [
		"age"
	]
},
	"application/vnd.ah-barcode": {
	source: "apache"
},
	"application/vnd.ahead.space": {
	source: "iana",
	extensions: [
		"ahead"
	]
},
	"application/vnd.airzip.filesecure.azf": {
	source: "iana",
	extensions: [
		"azf"
	]
},
	"application/vnd.airzip.filesecure.azs": {
	source: "iana",
	extensions: [
		"azs"
	]
},
	"application/vnd.amadeus+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.amazon.ebook": {
	source: "apache",
	extensions: [
		"azw"
	]
},
	"application/vnd.amazon.mobi8-ebook": {
	source: "iana"
},
	"application/vnd.americandynamics.acc": {
	source: "iana",
	extensions: [
		"acc"
	]
},
	"application/vnd.amiga.ami": {
	source: "iana",
	extensions: [
		"ami"
	]
},
	"application/vnd.amundsen.maze+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.android.ota": {
	source: "iana"
},
	"application/vnd.android.package-archive": {
	source: "apache",
	compressible: false,
	extensions: [
		"apk"
	]
},
	"application/vnd.anki": {
	source: "iana"
},
	"application/vnd.anser-web-certificate-issue-initiation": {
	source: "iana",
	extensions: [
		"cii"
	]
},
	"application/vnd.anser-web-funds-transfer-initiation": {
	source: "apache",
	extensions: [
		"fti"
	]
},
	"application/vnd.antix.game-component": {
	source: "iana",
	extensions: [
		"atx"
	]
},
	"application/vnd.apache.arrow.file": {
	source: "iana"
},
	"application/vnd.apache.arrow.stream": {
	source: "iana"
},
	"application/vnd.apache.parquet": {
	source: "iana"
},
	"application/vnd.apache.thrift.binary": {
	source: "iana"
},
	"application/vnd.apache.thrift.compact": {
	source: "iana"
},
	"application/vnd.apache.thrift.json": {
	source: "iana"
},
	"application/vnd.apexlang": {
	source: "iana"
},
	"application/vnd.api+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.aplextor.warrp+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.apothekende.reservation+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.apple.installer+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mpkg"
	]
},
	"application/vnd.apple.keynote": {
	source: "iana",
	extensions: [
		"key"
	]
},
	"application/vnd.apple.mpegurl": {
	source: "iana",
	extensions: [
		"m3u8"
	]
},
	"application/vnd.apple.numbers": {
	source: "iana",
	extensions: [
		"numbers"
	]
},
	"application/vnd.apple.pages": {
	source: "iana",
	extensions: [
		"pages"
	]
},
	"application/vnd.apple.pkpass": {
	compressible: false,
	extensions: [
		"pkpass"
	]
},
	"application/vnd.arastra.swi": {
	source: "apache"
},
	"application/vnd.aristanetworks.swi": {
	source: "iana",
	extensions: [
		"swi"
	]
},
	"application/vnd.artisan+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.artsquare": {
	source: "iana"
},
	"application/vnd.astraea-software.iota": {
	source: "iana",
	extensions: [
		"iota"
	]
},
	"application/vnd.audiograph": {
	source: "iana",
	extensions: [
		"aep"
	]
},
	"application/vnd.autopackage": {
	source: "iana"
},
	"application/vnd.avalon+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.avistar+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.balsamiq.bmml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"bmml"
	]
},
	"application/vnd.balsamiq.bmpr": {
	source: "iana"
},
	"application/vnd.banana-accounting": {
	source: "iana"
},
	"application/vnd.bbf.usp.error": {
	source: "iana"
},
	"application/vnd.bbf.usp.msg": {
	source: "iana"
},
	"application/vnd.bbf.usp.msg+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.bekitzur-stech+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.belightsoft.lhzd+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.belightsoft.lhzl+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.bint.med-content": {
	source: "iana"
},
	"application/vnd.biopax.rdf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.blink-idb-value-wrapper": {
	source: "iana"
},
	"application/vnd.blueice.multipass": {
	source: "iana",
	extensions: [
		"mpm"
	]
},
	"application/vnd.bluetooth.ep.oob": {
	source: "iana"
},
	"application/vnd.bluetooth.le.oob": {
	source: "iana"
},
	"application/vnd.bmi": {
	source: "iana",
	extensions: [
		"bmi"
	]
},
	"application/vnd.bpf": {
	source: "iana"
},
	"application/vnd.bpf3": {
	source: "iana"
},
	"application/vnd.businessobjects": {
	source: "iana",
	extensions: [
		"rep"
	]
},
	"application/vnd.byu.uapi+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.bzip3": {
	source: "iana"
},
	"application/vnd.c3voc.schedule+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.cab-jscript": {
	source: "iana"
},
	"application/vnd.canon-cpdl": {
	source: "iana"
},
	"application/vnd.canon-lips": {
	source: "iana"
},
	"application/vnd.capasystems-pg+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cendio.thinlinc.clientconf": {
	source: "iana"
},
	"application/vnd.century-systems.tcp_stream": {
	source: "iana"
},
	"application/vnd.chemdraw+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"cdxml"
	]
},
	"application/vnd.chess-pgn": {
	source: "iana"
},
	"application/vnd.chipnuts.karaoke-mmd": {
	source: "iana",
	extensions: [
		"mmd"
	]
},
	"application/vnd.ciedi": {
	source: "iana"
},
	"application/vnd.cinderella": {
	source: "iana",
	extensions: [
		"cdy"
	]
},
	"application/vnd.cirpack.isdn-ext": {
	source: "iana"
},
	"application/vnd.citationstyles.style+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"csl"
	]
},
	"application/vnd.claymore": {
	source: "iana",
	extensions: [
		"cla"
	]
},
	"application/vnd.cloanto.rp9": {
	source: "iana",
	extensions: [
		"rp9"
	]
},
	"application/vnd.clonk.c4group": {
	source: "iana",
	extensions: [
		"c4g",
		"c4d",
		"c4f",
		"c4p",
		"c4u"
	]
},
	"application/vnd.cluetrust.cartomobile-config": {
	source: "iana",
	extensions: [
		"c11amc"
	]
},
	"application/vnd.cluetrust.cartomobile-config-pkg": {
	source: "iana",
	extensions: [
		"c11amz"
	]
},
	"application/vnd.cncf.helm.chart.content.v1.tar+gzip": {
	source: "iana"
},
	"application/vnd.cncf.helm.chart.provenance.v1.prov": {
	source: "iana"
},
	"application/vnd.cncf.helm.config.v1+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.coffeescript": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.document": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.document-template": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.presentation": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.presentation-template": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.spreadsheet": {
	source: "iana"
},
	"application/vnd.collabio.xodocuments.spreadsheet-template": {
	source: "iana"
},
	"application/vnd.collection+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.collection.doc+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.collection.next+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.comicbook+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.comicbook-rar": {
	source: "iana"
},
	"application/vnd.commerce-battelle": {
	source: "iana"
},
	"application/vnd.commonspace": {
	source: "iana",
	extensions: [
		"csp"
	]
},
	"application/vnd.contact.cmsg": {
	source: "iana",
	extensions: [
		"cdbcmsg"
	]
},
	"application/vnd.coreos.ignition+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cosmocaller": {
	source: "iana",
	extensions: [
		"cmc"
	]
},
	"application/vnd.crick.clicker": {
	source: "iana",
	extensions: [
		"clkx"
	]
},
	"application/vnd.crick.clicker.keyboard": {
	source: "iana",
	extensions: [
		"clkk"
	]
},
	"application/vnd.crick.clicker.palette": {
	source: "iana",
	extensions: [
		"clkp"
	]
},
	"application/vnd.crick.clicker.template": {
	source: "iana",
	extensions: [
		"clkt"
	]
},
	"application/vnd.crick.clicker.wordbank": {
	source: "iana",
	extensions: [
		"clkw"
	]
},
	"application/vnd.criticaltools.wbs+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wbs"
	]
},
	"application/vnd.cryptii.pipe+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.crypto-shade-file": {
	source: "iana"
},
	"application/vnd.cryptomator.encrypted": {
	source: "iana"
},
	"application/vnd.cryptomator.vault": {
	source: "iana"
},
	"application/vnd.ctc-posml": {
	source: "iana",
	extensions: [
		"pml"
	]
},
	"application/vnd.ctct.ws+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.cups-pdf": {
	source: "iana"
},
	"application/vnd.cups-postscript": {
	source: "iana"
},
	"application/vnd.cups-ppd": {
	source: "iana",
	extensions: [
		"ppd"
	]
},
	"application/vnd.cups-raster": {
	source: "iana"
},
	"application/vnd.cups-raw": {
	source: "iana"
},
	"application/vnd.curl": {
	source: "iana"
},
	"application/vnd.curl.car": {
	source: "apache",
	extensions: [
		"car"
	]
},
	"application/vnd.curl.pcurl": {
	source: "apache",
	extensions: [
		"pcurl"
	]
},
	"application/vnd.cyan.dean.root+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.cybank": {
	source: "iana"
},
	"application/vnd.cyclonedx+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.cyclonedx+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.d2l.coursepackage1p0+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.d3m-dataset": {
	source: "iana"
},
	"application/vnd.d3m-problem": {
	source: "iana"
},
	"application/vnd.dart": {
	source: "iana",
	compressible: true,
	extensions: [
		"dart"
	]
},
	"application/vnd.data-vision.rdz": {
	source: "iana",
	extensions: [
		"rdz"
	]
},
	"application/vnd.datalog": {
	source: "iana"
},
	"application/vnd.datapackage+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.dataresource+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.dbf": {
	source: "iana",
	extensions: [
		"dbf"
	]
},
	"application/vnd.debian.binary-package": {
	source: "iana"
},
	"application/vnd.dece.data": {
	source: "iana",
	extensions: [
		"uvf",
		"uvvf",
		"uvd",
		"uvvd"
	]
},
	"application/vnd.dece.ttml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"uvt",
		"uvvt"
	]
},
	"application/vnd.dece.unspecified": {
	source: "iana",
	extensions: [
		"uvx",
		"uvvx"
	]
},
	"application/vnd.dece.zip": {
	source: "iana",
	extensions: [
		"uvz",
		"uvvz"
	]
},
	"application/vnd.denovo.fcselayout-link": {
	source: "iana",
	extensions: [
		"fe_launch"
	]
},
	"application/vnd.desmume.movie": {
	source: "iana"
},
	"application/vnd.dir-bi.plate-dl-nosuffix": {
	source: "iana"
},
	"application/vnd.dm.delegation+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dna": {
	source: "iana",
	extensions: [
		"dna"
	]
},
	"application/vnd.document+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.dolby.mlp": {
	source: "apache",
	extensions: [
		"mlp"
	]
},
	"application/vnd.dolby.mobile.1": {
	source: "iana"
},
	"application/vnd.dolby.mobile.2": {
	source: "iana"
},
	"application/vnd.doremir.scorecloud-binary-document": {
	source: "iana"
},
	"application/vnd.dpgraph": {
	source: "iana",
	extensions: [
		"dpg"
	]
},
	"application/vnd.dreamfactory": {
	source: "iana",
	extensions: [
		"dfac"
	]
},
	"application/vnd.drive+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ds-keypoint": {
	source: "apache",
	extensions: [
		"kpxx"
	]
},
	"application/vnd.dtg.local": {
	source: "iana"
},
	"application/vnd.dtg.local.flash": {
	source: "iana"
},
	"application/vnd.dtg.local.html": {
	source: "iana"
},
	"application/vnd.dvb.ait": {
	source: "iana",
	extensions: [
		"ait"
	]
},
	"application/vnd.dvb.dvbisl+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.dvbj": {
	source: "iana"
},
	"application/vnd.dvb.esgcontainer": {
	source: "iana"
},
	"application/vnd.dvb.ipdcdftnotifaccess": {
	source: "iana"
},
	"application/vnd.dvb.ipdcesgaccess": {
	source: "iana"
},
	"application/vnd.dvb.ipdcesgaccess2": {
	source: "iana"
},
	"application/vnd.dvb.ipdcesgpdd": {
	source: "iana"
},
	"application/vnd.dvb.ipdcroaming": {
	source: "iana"
},
	"application/vnd.dvb.iptv.alfec-base": {
	source: "iana"
},
	"application/vnd.dvb.iptv.alfec-enhancement": {
	source: "iana"
},
	"application/vnd.dvb.notif-aggregate-root+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-container+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-generic+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-ia-msglist+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-ia-registration-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-ia-registration-response+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.notif-init+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.dvb.pfr": {
	source: "iana"
},
	"application/vnd.dvb.service": {
	source: "iana",
	extensions: [
		"svc"
	]
},
	"application/vnd.dxr": {
	source: "iana"
},
	"application/vnd.dynageo": {
	source: "iana",
	extensions: [
		"geo"
	]
},
	"application/vnd.dzr": {
	source: "iana"
},
	"application/vnd.easykaraoke.cdgdownload": {
	source: "iana"
},
	"application/vnd.ecdis-update": {
	source: "iana"
},
	"application/vnd.ecip.rlp": {
	source: "iana"
},
	"application/vnd.eclipse.ditto+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ecowin.chart": {
	source: "iana",
	extensions: [
		"mag"
	]
},
	"application/vnd.ecowin.filerequest": {
	source: "iana"
},
	"application/vnd.ecowin.fileupdate": {
	source: "iana"
},
	"application/vnd.ecowin.series": {
	source: "iana"
},
	"application/vnd.ecowin.seriesrequest": {
	source: "iana"
},
	"application/vnd.ecowin.seriesupdate": {
	source: "iana"
},
	"application/vnd.efi.img": {
	source: "iana"
},
	"application/vnd.efi.iso": {
	source: "iana"
},
	"application/vnd.eln+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.emclient.accessrequest+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.enliven": {
	source: "iana",
	extensions: [
		"nml"
	]
},
	"application/vnd.enphase.envoy": {
	source: "iana"
},
	"application/vnd.eprints.data+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.epson.esf": {
	source: "iana",
	extensions: [
		"esf"
	]
},
	"application/vnd.epson.msf": {
	source: "iana",
	extensions: [
		"msf"
	]
},
	"application/vnd.epson.quickanime": {
	source: "iana",
	extensions: [
		"qam"
	]
},
	"application/vnd.epson.salt": {
	source: "iana",
	extensions: [
		"slt"
	]
},
	"application/vnd.epson.ssf": {
	source: "iana",
	extensions: [
		"ssf"
	]
},
	"application/vnd.ericsson.quickcall": {
	source: "iana"
},
	"application/vnd.erofs": {
	source: "iana"
},
	"application/vnd.espass-espass+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.eszigno3+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"es3",
		"et3"
	]
},
	"application/vnd.etsi.aoc+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.asic-e+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.etsi.asic-s+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.etsi.cug+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvcommand+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvdiscovery+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsad-bc+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsad-cod+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsad-npvr+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvservice+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvsync+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.iptvueprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.mcid+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.mheg5": {
	source: "iana"
},
	"application/vnd.etsi.overload-control-policy-dataset+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.pstn+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.sci+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.simservs+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.timestamp-token": {
	source: "iana"
},
	"application/vnd.etsi.tsl+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.etsi.tsl.der": {
	source: "iana"
},
	"application/vnd.eu.kasparian.car+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.eudora.data": {
	source: "iana"
},
	"application/vnd.evolv.ecig.profile": {
	source: "iana"
},
	"application/vnd.evolv.ecig.settings": {
	source: "iana"
},
	"application/vnd.evolv.ecig.theme": {
	source: "iana"
},
	"application/vnd.exstream-empower+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.exstream-package": {
	source: "iana"
},
	"application/vnd.ezpix-album": {
	source: "iana",
	extensions: [
		"ez2"
	]
},
	"application/vnd.ezpix-package": {
	source: "iana",
	extensions: [
		"ez3"
	]
},
	"application/vnd.f-secure.mobile": {
	source: "iana"
},
	"application/vnd.familysearch.gedcom+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.fastcopy-disk-image": {
	source: "iana"
},
	"application/vnd.fdf": {
	source: "apache",
	extensions: [
		"fdf"
	]
},
	"application/vnd.fdsn.mseed": {
	source: "iana",
	extensions: [
		"mseed"
	]
},
	"application/vnd.fdsn.seed": {
	source: "iana",
	extensions: [
		"seed",
		"dataless"
	]
},
	"application/vnd.ffsns": {
	source: "iana"
},
	"application/vnd.ficlab.flb+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.filmit.zfc": {
	source: "iana"
},
	"application/vnd.fints": {
	source: "iana"
},
	"application/vnd.firemonkeys.cloudcell": {
	source: "iana"
},
	"application/vnd.flographit": {
	source: "iana",
	extensions: [
		"gph"
	]
},
	"application/vnd.fluxtime.clip": {
	source: "iana",
	extensions: [
		"ftc"
	]
},
	"application/vnd.font-fontforge-sfd": {
	source: "iana"
},
	"application/vnd.framemaker": {
	source: "iana",
	extensions: [
		"fm",
		"frame",
		"maker",
		"book"
	]
},
	"application/vnd.freelog.comic": {
	source: "iana"
},
	"application/vnd.frogans.fnc": {
	source: "apache",
	extensions: [
		"fnc"
	]
},
	"application/vnd.frogans.ltf": {
	source: "apache",
	extensions: [
		"ltf"
	]
},
	"application/vnd.fsc.weblaunch": {
	source: "iana",
	extensions: [
		"fsc"
	]
},
	"application/vnd.fujifilm.fb.docuworks": {
	source: "iana"
},
	"application/vnd.fujifilm.fb.docuworks.binder": {
	source: "iana"
},
	"application/vnd.fujifilm.fb.docuworks.container": {
	source: "iana"
},
	"application/vnd.fujifilm.fb.jfi+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.fujitsu.oasys": {
	source: "iana",
	extensions: [
		"oas"
	]
},
	"application/vnd.fujitsu.oasys2": {
	source: "iana",
	extensions: [
		"oa2"
	]
},
	"application/vnd.fujitsu.oasys3": {
	source: "iana",
	extensions: [
		"oa3"
	]
},
	"application/vnd.fujitsu.oasysgp": {
	source: "iana",
	extensions: [
		"fg5"
	]
},
	"application/vnd.fujitsu.oasysprs": {
	source: "iana",
	extensions: [
		"bh2"
	]
},
	"application/vnd.fujixerox.art-ex": {
	source: "iana"
},
	"application/vnd.fujixerox.art4": {
	source: "iana"
},
	"application/vnd.fujixerox.ddd": {
	source: "iana",
	extensions: [
		"ddd"
	]
},
	"application/vnd.fujixerox.docuworks": {
	source: "iana",
	extensions: [
		"xdw"
	]
},
	"application/vnd.fujixerox.docuworks.binder": {
	source: "iana",
	extensions: [
		"xbd"
	]
},
	"application/vnd.fujixerox.docuworks.container": {
	source: "iana"
},
	"application/vnd.fujixerox.hbpl": {
	source: "iana"
},
	"application/vnd.fut-misnet": {
	source: "iana"
},
	"application/vnd.futoin+cbor": {
	source: "iana"
},
	"application/vnd.futoin+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.fuzzysheet": {
	source: "iana",
	extensions: [
		"fzs"
	]
},
	"application/vnd.ga4gh.passport+jwt": {
	source: "iana"
},
	"application/vnd.genomatix.tuxedo": {
	source: "iana",
	extensions: [
		"txd"
	]
},
	"application/vnd.genozip": {
	source: "iana"
},
	"application/vnd.gentics.grd+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.gentoo.catmetadata+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.gentoo.ebuild": {
	source: "iana"
},
	"application/vnd.gentoo.eclass": {
	source: "iana"
},
	"application/vnd.gentoo.gpkg": {
	source: "iana"
},
	"application/vnd.gentoo.manifest": {
	source: "iana"
},
	"application/vnd.gentoo.pkgmetadata+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.gentoo.xpak": {
	source: "iana"
},
	"application/vnd.geo+json": {
	source: "apache",
	compressible: true
},
	"application/vnd.geocube+xml": {
	source: "apache",
	compressible: true
},
	"application/vnd.geogebra.file": {
	source: "iana",
	extensions: [
		"ggb"
	]
},
	"application/vnd.geogebra.slides": {
	source: "iana",
	extensions: [
		"ggs"
	]
},
	"application/vnd.geogebra.tool": {
	source: "iana",
	extensions: [
		"ggt"
	]
},
	"application/vnd.geometry-explorer": {
	source: "iana",
	extensions: [
		"gex",
		"gre"
	]
},
	"application/vnd.geonext": {
	source: "iana",
	extensions: [
		"gxt"
	]
},
	"application/vnd.geoplan": {
	source: "iana",
	extensions: [
		"g2w"
	]
},
	"application/vnd.geospace": {
	source: "iana",
	extensions: [
		"g3w"
	]
},
	"application/vnd.gerber": {
	source: "iana"
},
	"application/vnd.globalplatform.card-content-mgt": {
	source: "iana"
},
	"application/vnd.globalplatform.card-content-mgt-response": {
	source: "iana"
},
	"application/vnd.gmx": {
	source: "iana",
	extensions: [
		"gmx"
	]
},
	"application/vnd.gnu.taler.exchange+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.gnu.taler.merchant+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.google-apps.document": {
	compressible: false,
	extensions: [
		"gdoc"
	]
},
	"application/vnd.google-apps.presentation": {
	compressible: false,
	extensions: [
		"gslides"
	]
},
	"application/vnd.google-apps.spreadsheet": {
	compressible: false,
	extensions: [
		"gsheet"
	]
},
	"application/vnd.google-earth.kml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"kml"
	]
},
	"application/vnd.google-earth.kmz": {
	source: "iana",
	compressible: false,
	extensions: [
		"kmz"
	]
},
	"application/vnd.gov.sk.e-form+xml": {
	source: "apache",
	compressible: true
},
	"application/vnd.gov.sk.e-form+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.gov.sk.xmldatacontainer+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xdcf"
	]
},
	"application/vnd.gpxsee.map+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.grafeq": {
	source: "iana",
	extensions: [
		"gqf",
		"gqs"
	]
},
	"application/vnd.gridmp": {
	source: "iana"
},
	"application/vnd.groove-account": {
	source: "iana",
	extensions: [
		"gac"
	]
},
	"application/vnd.groove-help": {
	source: "iana",
	extensions: [
		"ghf"
	]
},
	"application/vnd.groove-identity-message": {
	source: "iana",
	extensions: [
		"gim"
	]
},
	"application/vnd.groove-injector": {
	source: "iana",
	extensions: [
		"grv"
	]
},
	"application/vnd.groove-tool-message": {
	source: "iana",
	extensions: [
		"gtm"
	]
},
	"application/vnd.groove-tool-template": {
	source: "iana",
	extensions: [
		"tpl"
	]
},
	"application/vnd.groove-vcard": {
	source: "iana",
	extensions: [
		"vcg"
	]
},
	"application/vnd.hal+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hal+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"hal"
	]
},
	"application/vnd.handheld-entertainment+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"zmm"
	]
},
	"application/vnd.hbci": {
	source: "iana",
	extensions: [
		"hbci"
	]
},
	"application/vnd.hc+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hcl-bireports": {
	source: "iana"
},
	"application/vnd.hdt": {
	source: "iana"
},
	"application/vnd.heroku+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hhe.lesson-player": {
	source: "iana",
	extensions: [
		"les"
	]
},
	"application/vnd.hp-hpgl": {
	source: "iana",
	extensions: [
		"hpgl"
	]
},
	"application/vnd.hp-hpid": {
	source: "iana",
	extensions: [
		"hpid"
	]
},
	"application/vnd.hp-hps": {
	source: "iana",
	extensions: [
		"hps"
	]
},
	"application/vnd.hp-jlyt": {
	source: "iana",
	extensions: [
		"jlt"
	]
},
	"application/vnd.hp-pcl": {
	source: "iana",
	extensions: [
		"pcl"
	]
},
	"application/vnd.hp-pclxl": {
	source: "iana",
	extensions: [
		"pclxl"
	]
},
	"application/vnd.hsl": {
	source: "iana"
},
	"application/vnd.httphone": {
	source: "iana"
},
	"application/vnd.hydrostatix.sof-data": {
	source: "iana",
	extensions: [
		"sfd-hdstx"
	]
},
	"application/vnd.hyper+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hyper-item+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hyperdrive+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.hzn-3d-crossword": {
	source: "iana"
},
	"application/vnd.ibm.afplinedata": {
	source: "apache"
},
	"application/vnd.ibm.electronic-media": {
	source: "iana"
},
	"application/vnd.ibm.minipay": {
	source: "iana",
	extensions: [
		"mpy"
	]
},
	"application/vnd.ibm.modcap": {
	source: "apache",
	extensions: [
		"afp",
		"listafp",
		"list3820"
	]
},
	"application/vnd.ibm.rights-management": {
	source: "iana",
	extensions: [
		"irm"
	]
},
	"application/vnd.ibm.secure-container": {
	source: "iana",
	extensions: [
		"sc"
	]
},
	"application/vnd.iccprofile": {
	source: "iana",
	extensions: [
		"icc",
		"icm"
	]
},
	"application/vnd.ieee.1905": {
	source: "iana"
},
	"application/vnd.igloader": {
	source: "iana",
	extensions: [
		"igl"
	]
},
	"application/vnd.imagemeter.folder+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.imagemeter.image+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.immervision-ivp": {
	source: "iana",
	extensions: [
		"ivp"
	]
},
	"application/vnd.immervision-ivu": {
	source: "iana",
	extensions: [
		"ivu"
	]
},
	"application/vnd.ims.imsccv1p1": {
	source: "iana"
},
	"application/vnd.ims.imsccv1p2": {
	source: "iana"
},
	"application/vnd.ims.imsccv1p3": {
	source: "iana"
},
	"application/vnd.ims.lis.v2.result+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolconsumerprofile+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolproxy+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolproxy.id+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolsettings+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.ims.lti.v2.toolsettings.simple+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.informedcontrol.rms+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.informix-visionary": {
	source: "apache"
},
	"application/vnd.infotech.project": {
	source: "iana"
},
	"application/vnd.infotech.project+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.innopath.wamp.notification": {
	source: "iana"
},
	"application/vnd.insors.igm": {
	source: "iana",
	extensions: [
		"igm"
	]
},
	"application/vnd.intercon.formnet": {
	source: "iana",
	extensions: [
		"xpw",
		"xpx"
	]
},
	"application/vnd.intergeo": {
	source: "iana",
	extensions: [
		"i2g"
	]
},
	"application/vnd.intertrust.digibox": {
	source: "iana"
},
	"application/vnd.intertrust.nncp": {
	source: "iana"
},
	"application/vnd.intu.qbo": {
	source: "iana",
	extensions: [
		"qbo"
	]
},
	"application/vnd.intu.qfx": {
	source: "iana",
	extensions: [
		"qfx"
	]
},
	"application/vnd.ipfs.ipns-record": {
	source: "iana"
},
	"application/vnd.ipld.car": {
	source: "iana"
},
	"application/vnd.ipld.dag-cbor": {
	source: "iana"
},
	"application/vnd.ipld.dag-json": {
	source: "iana"
},
	"application/vnd.ipld.raw": {
	source: "iana"
},
	"application/vnd.iptc.g2.catalogitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.conceptitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.knowledgeitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.newsitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.newsmessage+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.packageitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.iptc.g2.planningitem+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ipunplugged.rcprofile": {
	source: "iana",
	extensions: [
		"rcprofile"
	]
},
	"application/vnd.irepository.package+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"irp"
	]
},
	"application/vnd.is-xpr": {
	source: "iana",
	extensions: [
		"xpr"
	]
},
	"application/vnd.isac.fcs": {
	source: "iana",
	extensions: [
		"fcs"
	]
},
	"application/vnd.iso11783-10+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.jam": {
	source: "iana",
	extensions: [
		"jam"
	]
},
	"application/vnd.japannet-directory-service": {
	source: "iana"
},
	"application/vnd.japannet-jpnstore-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-payment-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-registration": {
	source: "iana"
},
	"application/vnd.japannet-registration-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-setstore-wakeup": {
	source: "iana"
},
	"application/vnd.japannet-verification": {
	source: "iana"
},
	"application/vnd.japannet-verification-wakeup": {
	source: "iana"
},
	"application/vnd.jcp.javame.midlet-rms": {
	source: "iana",
	extensions: [
		"rms"
	]
},
	"application/vnd.jisp": {
	source: "iana",
	extensions: [
		"jisp"
	]
},
	"application/vnd.joost.joda-archive": {
	source: "iana",
	extensions: [
		"joda"
	]
},
	"application/vnd.jsk.isdn-ngn": {
	source: "iana"
},
	"application/vnd.kahootz": {
	source: "iana",
	extensions: [
		"ktz",
		"ktr"
	]
},
	"application/vnd.kde.karbon": {
	source: "iana",
	extensions: [
		"karbon"
	]
},
	"application/vnd.kde.kchart": {
	source: "iana",
	extensions: [
		"chrt"
	]
},
	"application/vnd.kde.kformula": {
	source: "iana",
	extensions: [
		"kfo"
	]
},
	"application/vnd.kde.kivio": {
	source: "iana",
	extensions: [
		"flw"
	]
},
	"application/vnd.kde.kontour": {
	source: "iana",
	extensions: [
		"kon"
	]
},
	"application/vnd.kde.kpresenter": {
	source: "iana",
	extensions: [
		"kpr",
		"kpt"
	]
},
	"application/vnd.kde.kspread": {
	source: "iana",
	extensions: [
		"ksp"
	]
},
	"application/vnd.kde.kword": {
	source: "iana",
	extensions: [
		"kwd",
		"kwt"
	]
},
	"application/vnd.kenameaapp": {
	source: "iana",
	extensions: [
		"htke"
	]
},
	"application/vnd.kidspiration": {
	source: "iana",
	extensions: [
		"kia"
	]
},
	"application/vnd.kinar": {
	source: "iana",
	extensions: [
		"kne",
		"knp"
	]
},
	"application/vnd.koan": {
	source: "iana",
	extensions: [
		"skp",
		"skd",
		"skt",
		"skm"
	]
},
	"application/vnd.kodak-descriptor": {
	source: "iana",
	extensions: [
		"sse"
	]
},
	"application/vnd.las": {
	source: "iana"
},
	"application/vnd.las.las+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.las.las+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lasxml"
	]
},
	"application/vnd.laszip": {
	source: "iana"
},
	"application/vnd.ldev.productlicensing": {
	source: "iana"
},
	"application/vnd.leap+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.liberty-request+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.llamagraphics.life-balance.desktop": {
	source: "iana",
	extensions: [
		"lbd"
	]
},
	"application/vnd.llamagraphics.life-balance.exchange+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"lbe"
	]
},
	"application/vnd.logipipe.circuit+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.loom": {
	source: "iana"
},
	"application/vnd.lotus-1-2-3": {
	source: "iana",
	extensions: [
		"123"
	]
},
	"application/vnd.lotus-approach": {
	source: "iana",
	extensions: [
		"apr"
	]
},
	"application/vnd.lotus-freelance": {
	source: "iana",
	extensions: [
		"pre"
	]
},
	"application/vnd.lotus-notes": {
	source: "iana",
	extensions: [
		"nsf"
	]
},
	"application/vnd.lotus-organizer": {
	source: "iana",
	extensions: [
		"org"
	]
},
	"application/vnd.lotus-screencam": {
	source: "iana",
	extensions: [
		"scm"
	]
},
	"application/vnd.lotus-wordpro": {
	source: "iana",
	extensions: [
		"lwp"
	]
},
	"application/vnd.macports.portpkg": {
	source: "iana",
	extensions: [
		"portpkg"
	]
},
	"application/vnd.mapbox-vector-tile": {
	source: "iana",
	extensions: [
		"mvt"
	]
},
	"application/vnd.marlin.drm.actiontoken+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.marlin.drm.conftoken+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.marlin.drm.license+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.marlin.drm.mdcf": {
	source: "iana"
},
	"application/vnd.mason+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.maxar.archive.3tz+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.maxmind.maxmind-db": {
	source: "iana"
},
	"application/vnd.mcd": {
	source: "iana",
	extensions: [
		"mcd"
	]
},
	"application/vnd.mdl": {
	source: "iana"
},
	"application/vnd.mdl-mbsdf": {
	source: "iana"
},
	"application/vnd.medcalcdata": {
	source: "iana",
	extensions: [
		"mc1"
	]
},
	"application/vnd.mediastation.cdkey": {
	source: "iana",
	extensions: [
		"cdkey"
	]
},
	"application/vnd.medicalholodeck.recordxr": {
	source: "iana"
},
	"application/vnd.meridian-slingshot": {
	source: "iana"
},
	"application/vnd.mermaid": {
	source: "iana"
},
	"application/vnd.mfer": {
	source: "iana",
	extensions: [
		"mwf"
	]
},
	"application/vnd.mfmp": {
	source: "iana",
	extensions: [
		"mfm"
	]
},
	"application/vnd.micro+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.micrografx.flo": {
	source: "iana",
	extensions: [
		"flo"
	]
},
	"application/vnd.micrografx.igx": {
	source: "iana",
	extensions: [
		"igx"
	]
},
	"application/vnd.microsoft.portable-executable": {
	source: "iana"
},
	"application/vnd.microsoft.windows.thumbnail-cache": {
	source: "iana"
},
	"application/vnd.miele+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.mif": {
	source: "iana",
	extensions: [
		"mif"
	]
},
	"application/vnd.minisoft-hp3000-save": {
	source: "iana"
},
	"application/vnd.mitsubishi.misty-guard.trustweb": {
	source: "iana"
},
	"application/vnd.mobius.daf": {
	source: "iana",
	extensions: [
		"daf"
	]
},
	"application/vnd.mobius.dis": {
	source: "iana",
	extensions: [
		"dis"
	]
},
	"application/vnd.mobius.mbk": {
	source: "iana",
	extensions: [
		"mbk"
	]
},
	"application/vnd.mobius.mqy": {
	source: "iana",
	extensions: [
		"mqy"
	]
},
	"application/vnd.mobius.msl": {
	source: "iana",
	extensions: [
		"msl"
	]
},
	"application/vnd.mobius.plc": {
	source: "iana",
	extensions: [
		"plc"
	]
},
	"application/vnd.mobius.txf": {
	source: "iana",
	extensions: [
		"txf"
	]
},
	"application/vnd.modl": {
	source: "iana"
},
	"application/vnd.mophun.application": {
	source: "iana",
	extensions: [
		"mpn"
	]
},
	"application/vnd.mophun.certificate": {
	source: "iana",
	extensions: [
		"mpc"
	]
},
	"application/vnd.motorola.flexsuite": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.adsi": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.fis": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.gotap": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.kmr": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.ttc": {
	source: "iana"
},
	"application/vnd.motorola.flexsuite.wem": {
	source: "iana"
},
	"application/vnd.motorola.iprm": {
	source: "iana"
},
	"application/vnd.mozilla.xul+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xul"
	]
},
	"application/vnd.ms-3mfdocument": {
	source: "iana"
},
	"application/vnd.ms-artgalry": {
	source: "iana",
	extensions: [
		"cil"
	]
},
	"application/vnd.ms-asf": {
	source: "iana"
},
	"application/vnd.ms-cab-compressed": {
	source: "iana",
	extensions: [
		"cab"
	]
},
	"application/vnd.ms-color.iccprofile": {
	source: "apache"
},
	"application/vnd.ms-excel": {
	source: "iana",
	compressible: false,
	extensions: [
		"xls",
		"xlm",
		"xla",
		"xlc",
		"xlt",
		"xlw"
	]
},
	"application/vnd.ms-excel.addin.macroenabled.12": {
	source: "iana",
	extensions: [
		"xlam"
	]
},
	"application/vnd.ms-excel.sheet.binary.macroenabled.12": {
	source: "iana",
	extensions: [
		"xlsb"
	]
},
	"application/vnd.ms-excel.sheet.macroenabled.12": {
	source: "iana",
	extensions: [
		"xlsm"
	]
},
	"application/vnd.ms-excel.template.macroenabled.12": {
	source: "iana",
	extensions: [
		"xltm"
	]
},
	"application/vnd.ms-fontobject": {
	source: "iana",
	compressible: true,
	extensions: [
		"eot"
	]
},
	"application/vnd.ms-htmlhelp": {
	source: "iana",
	extensions: [
		"chm"
	]
},
	"application/vnd.ms-ims": {
	source: "iana",
	extensions: [
		"ims"
	]
},
	"application/vnd.ms-lrm": {
	source: "iana",
	extensions: [
		"lrm"
	]
},
	"application/vnd.ms-office.activex+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-officetheme": {
	source: "iana",
	extensions: [
		"thmx"
	]
},
	"application/vnd.ms-opentype": {
	source: "apache",
	compressible: true
},
	"application/vnd.ms-outlook": {
	compressible: false,
	extensions: [
		"msg"
	]
},
	"application/vnd.ms-package.obfuscated-opentype": {
	source: "apache"
},
	"application/vnd.ms-pki.seccat": {
	source: "apache",
	extensions: [
		"cat"
	]
},
	"application/vnd.ms-pki.stl": {
	source: "apache",
	extensions: [
		"stl"
	]
},
	"application/vnd.ms-playready.initiator+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-powerpoint": {
	source: "iana",
	compressible: false,
	extensions: [
		"ppt",
		"pps",
		"pot"
	]
},
	"application/vnd.ms-powerpoint.addin.macroenabled.12": {
	source: "iana",
	extensions: [
		"ppam"
	]
},
	"application/vnd.ms-powerpoint.presentation.macroenabled.12": {
	source: "iana",
	extensions: [
		"pptm"
	]
},
	"application/vnd.ms-powerpoint.slide.macroenabled.12": {
	source: "iana",
	extensions: [
		"sldm"
	]
},
	"application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
	source: "iana",
	extensions: [
		"ppsm"
	]
},
	"application/vnd.ms-powerpoint.template.macroenabled.12": {
	source: "iana",
	extensions: [
		"potm"
	]
},
	"application/vnd.ms-printdevicecapabilities+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-printing.printticket+xml": {
	source: "apache",
	compressible: true
},
	"application/vnd.ms-printschematicket+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.ms-project": {
	source: "iana",
	extensions: [
		"mpp",
		"mpt"
	]
},
	"application/vnd.ms-tnef": {
	source: "iana"
},
	"application/vnd.ms-windows.devicepairing": {
	source: "iana"
},
	"application/vnd.ms-windows.nwprinting.oob": {
	source: "iana"
},
	"application/vnd.ms-windows.printerpairing": {
	source: "iana"
},
	"application/vnd.ms-windows.wsd.oob": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.lic-chlg-req": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.lic-resp": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.meter-chlg-req": {
	source: "iana"
},
	"application/vnd.ms-wmdrm.meter-resp": {
	source: "iana"
},
	"application/vnd.ms-word.document.macroenabled.12": {
	source: "iana",
	extensions: [
		"docm"
	]
},
	"application/vnd.ms-word.template.macroenabled.12": {
	source: "iana",
	extensions: [
		"dotm"
	]
},
	"application/vnd.ms-works": {
	source: "iana",
	extensions: [
		"wps",
		"wks",
		"wcm",
		"wdb"
	]
},
	"application/vnd.ms-wpl": {
	source: "iana",
	extensions: [
		"wpl"
	]
},
	"application/vnd.ms-xpsdocument": {
	source: "iana",
	compressible: false,
	extensions: [
		"xps"
	]
},
	"application/vnd.msa-disk-image": {
	source: "iana"
},
	"application/vnd.mseq": {
	source: "iana",
	extensions: [
		"mseq"
	]
},
	"application/vnd.msgpack": {
	source: "iana"
},
	"application/vnd.msign": {
	source: "iana"
},
	"application/vnd.multiad.creator": {
	source: "iana"
},
	"application/vnd.multiad.creator.cif": {
	source: "iana"
},
	"application/vnd.music-niff": {
	source: "iana"
},
	"application/vnd.musician": {
	source: "iana",
	extensions: [
		"mus"
	]
},
	"application/vnd.muvee.style": {
	source: "iana",
	extensions: [
		"msty"
	]
},
	"application/vnd.mynfc": {
	source: "iana",
	extensions: [
		"taglet"
	]
},
	"application/vnd.nacamar.ybrid+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.nato.bindingdataobject+cbor": {
	source: "iana"
},
	"application/vnd.nato.bindingdataobject+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.nato.bindingdataobject+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"bdo"
	]
},
	"application/vnd.nato.openxmlformats-package.iepd+zip": {
	source: "iana",
	compressible: false
},
	"application/vnd.ncd.control": {
	source: "iana"
},
	"application/vnd.ncd.reference": {
	source: "iana"
},
	"application/vnd.nearst.inv+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.nebumind.line": {
	source: "iana"
},
	"application/vnd.nervana": {
	source: "iana"
},
	"application/vnd.netfpx": {
	source: "iana"
},
	"application/vnd.neurolanguage.nlu": {
	source: "iana",
	extensions: [
		"nlu"
	]
},
	"application/vnd.nimn": {
	source: "iana"
},
	"application/vnd.nintendo.nitro.rom": {
	source: "iana"
},
	"application/vnd.nintendo.snes.rom": {
	source: "iana"
},
	"application/vnd.nitf": {
	source: "iana",
	extensions: [
		"ntf",
		"nitf"
	]
},
	"application/vnd.noblenet-directory": {
	source: "iana",
	extensions: [
		"nnd"
	]
},
	"application/vnd.noblenet-sealer": {
	source: "iana",
	extensions: [
		"nns"
	]
},
	"application/vnd.noblenet-web": {
	source: "iana",
	extensions: [
		"nnw"
	]
},
	"application/vnd.nokia.catalogs": {
	source: "iana"
},
	"application/vnd.nokia.conml+wbxml": {
	source: "iana"
},
	"application/vnd.nokia.conml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.iptv.config+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.isds-radio-presets": {
	source: "iana"
},
	"application/vnd.nokia.landmark+wbxml": {
	source: "iana"
},
	"application/vnd.nokia.landmark+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.landmarkcollection+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.n-gage.ac+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"ac"
	]
},
	"application/vnd.nokia.n-gage.data": {
	source: "iana",
	extensions: [
		"ngdat"
	]
},
	"application/vnd.nokia.n-gage.symbian.install": {
	source: "apache",
	extensions: [
		"n-gage"
	]
},
	"application/vnd.nokia.ncd": {
	source: "iana"
},
	"application/vnd.nokia.pcd+wbxml": {
	source: "iana"
},
	"application/vnd.nokia.pcd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.nokia.radio-preset": {
	source: "iana",
	extensions: [
		"rpst"
	]
},
	"application/vnd.nokia.radio-presets": {
	source: "iana",
	extensions: [
		"rpss"
	]
},
	"application/vnd.novadigm.edm": {
	source: "iana",
	extensions: [
		"edm"
	]
},
	"application/vnd.novadigm.edx": {
	source: "iana",
	extensions: [
		"edx"
	]
},
	"application/vnd.novadigm.ext": {
	source: "iana",
	extensions: [
		"ext"
	]
},
	"application/vnd.ntt-local.content-share": {
	source: "iana"
},
	"application/vnd.ntt-local.file-transfer": {
	source: "iana"
},
	"application/vnd.ntt-local.ogw_remote-access": {
	source: "iana"
},
	"application/vnd.ntt-local.sip-ta_remote": {
	source: "iana"
},
	"application/vnd.ntt-local.sip-ta_tcp_stream": {
	source: "iana"
},
	"application/vnd.oai.workflows": {
	source: "iana"
},
	"application/vnd.oai.workflows+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.oai.workflows+yaml": {
	source: "iana"
},
	"application/vnd.oasis.opendocument.base": {
	source: "iana"
},
	"application/vnd.oasis.opendocument.chart": {
	source: "iana",
	extensions: [
		"odc"
	]
},
	"application/vnd.oasis.opendocument.chart-template": {
	source: "iana",
	extensions: [
		"otc"
	]
},
	"application/vnd.oasis.opendocument.database": {
	source: "apache",
	extensions: [
		"odb"
	]
},
	"application/vnd.oasis.opendocument.formula": {
	source: "iana",
	extensions: [
		"odf"
	]
},
	"application/vnd.oasis.opendocument.formula-template": {
	source: "iana",
	extensions: [
		"odft"
	]
},
	"application/vnd.oasis.opendocument.graphics": {
	source: "iana",
	compressible: false,
	extensions: [
		"odg"
	]
},
	"application/vnd.oasis.opendocument.graphics-template": {
	source: "iana",
	extensions: [
		"otg"
	]
},
	"application/vnd.oasis.opendocument.image": {
	source: "iana",
	extensions: [
		"odi"
	]
},
	"application/vnd.oasis.opendocument.image-template": {
	source: "iana",
	extensions: [
		"oti"
	]
},
	"application/vnd.oasis.opendocument.presentation": {
	source: "iana",
	compressible: false,
	extensions: [
		"odp"
	]
},
	"application/vnd.oasis.opendocument.presentation-template": {
	source: "iana",
	extensions: [
		"otp"
	]
},
	"application/vnd.oasis.opendocument.spreadsheet": {
	source: "iana",
	compressible: false,
	extensions: [
		"ods"
	]
},
	"application/vnd.oasis.opendocument.spreadsheet-template": {
	source: "iana",
	extensions: [
		"ots"
	]
},
	"application/vnd.oasis.opendocument.text": {
	source: "iana",
	compressible: false,
	extensions: [
		"odt"
	]
},
	"application/vnd.oasis.opendocument.text-master": {
	source: "iana",
	extensions: [
		"odm"
	]
},
	"application/vnd.oasis.opendocument.text-master-template": {
	source: "iana"
},
	"application/vnd.oasis.opendocument.text-template": {
	source: "iana",
	extensions: [
		"ott"
	]
},
	"application/vnd.oasis.opendocument.text-web": {
	source: "iana",
	extensions: [
		"oth"
	]
},
	"application/vnd.obn": {
	source: "iana"
},
	"application/vnd.ocf+cbor": {
	source: "iana"
},
	"application/vnd.oci.image.manifest.v1+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.oftn.l10n+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.contentaccessdownload+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.contentaccessstreaming+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.cspg-hexbinary": {
	source: "iana"
},
	"application/vnd.oipf.dae.svg+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.dae.xhtml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.mippvcontrolmessage+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.pae.gem": {
	source: "iana"
},
	"application/vnd.oipf.spdiscovery+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.spdlist+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.ueprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oipf.userprofile+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.olpc-sugar": {
	source: "iana",
	extensions: [
		"xo"
	]
},
	"application/vnd.oma-scws-config": {
	source: "iana"
},
	"application/vnd.oma-scws-http-request": {
	source: "iana"
},
	"application/vnd.oma-scws-http-response": {
	source: "iana"
},
	"application/vnd.oma.bcast.associated-procedure-parameter+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.drm-trigger+xml": {
	source: "apache",
	compressible: true
},
	"application/vnd.oma.bcast.imd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.ltkm": {
	source: "iana"
},
	"application/vnd.oma.bcast.notification+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.provisioningtrigger": {
	source: "iana"
},
	"application/vnd.oma.bcast.sgboot": {
	source: "iana"
},
	"application/vnd.oma.bcast.sgdd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.sgdu": {
	source: "iana"
},
	"application/vnd.oma.bcast.simple-symbol-container": {
	source: "iana"
},
	"application/vnd.oma.bcast.smartcard-trigger+xml": {
	source: "apache",
	compressible: true
},
	"application/vnd.oma.bcast.sprov+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.bcast.stkm": {
	source: "iana"
},
	"application/vnd.oma.cab-address-book+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-feature-handler+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-pcc+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-subs-invite+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.cab-user-prefs+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.dcd": {
	source: "iana"
},
	"application/vnd.oma.dcdc": {
	source: "iana"
},
	"application/vnd.oma.dd2+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"dd2"
	]
},
	"application/vnd.oma.drm.risd+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.group-usage-list+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.lwm2m+cbor": {
	source: "iana"
},
	"application/vnd.oma.lwm2m+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.lwm2m+tlv": {
	source: "iana"
},
	"application/vnd.oma.pal+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.detailed-progress-report+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.final-report+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.groups+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.invocation-descriptor+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.poc.optimized-progress-report+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.push": {
	source: "iana"
},
	"application/vnd.oma.scidm.messages+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oma.xcap-directory+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.omads-email+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.omads-file+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.omads-folder+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.omaloc-supl-init": {
	source: "iana"
},
	"application/vnd.onepager": {
	source: "iana"
},
	"application/vnd.onepagertamp": {
	source: "iana"
},
	"application/vnd.onepagertamx": {
	source: "iana"
},
	"application/vnd.onepagertat": {
	source: "iana"
},
	"application/vnd.onepagertatp": {
	source: "iana"
},
	"application/vnd.onepagertatx": {
	source: "iana"
},
	"application/vnd.onvif.metadata": {
	source: "iana"
},
	"application/vnd.openblox.game+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"obgx"
	]
},
	"application/vnd.openblox.game-binary": {
	source: "iana"
},
	"application/vnd.openeye.oeb": {
	source: "iana"
},
	"application/vnd.openofficeorg.extension": {
	source: "apache",
	extensions: [
		"oxt"
	]
},
	"application/vnd.openstreetmap.data+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"osm"
	]
},
	"application/vnd.opentimestamps.ots": {
	source: "iana"
},
	"application/vnd.openxmlformats-officedocument.custom-properties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawing+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.extended-properties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.presentation": {
	source: "iana",
	compressible: false,
	extensions: [
		"pptx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slide": {
	source: "iana",
	extensions: [
		"sldx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
	source: "iana",
	extensions: [
		"ppsx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.template": {
	source: "iana",
	extensions: [
		"potx"
	]
},
	"application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
	source: "iana",
	compressible: false,
	extensions: [
		"xlsx"
	]
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
	source: "iana",
	extensions: [
		"xltx"
	]
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.theme+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.themeoverride+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.vmldrawing": {
	source: "iana"
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
	source: "iana",
	compressible: false,
	extensions: [
		"docx"
	]
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
	source: "iana",
	extensions: [
		"dotx"
	]
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-package.core-properties+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.openxmlformats-package.relationships+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oracle.resource+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.orange.indata": {
	source: "iana"
},
	"application/vnd.osa.netdeploy": {
	source: "iana"
},
	"application/vnd.osgeo.mapguide.package": {
	source: "iana",
	extensions: [
		"mgp"
	]
},
	"application/vnd.osgi.bundle": {
	source: "iana"
},
	"application/vnd.osgi.dp": {
	source: "iana",
	extensions: [
		"dp"
	]
},
	"application/vnd.osgi.subsystem": {
	source: "iana",
	extensions: [
		"esa"
	]
},
	"application/vnd.otps.ct-kip+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.oxli.countgraph": {
	source: "iana"
},
	"application/vnd.pagerduty+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.palm": {
	source: "iana",
	extensions: [
		"pdb",
		"pqa",
		"oprc"
	]
},
	"application/vnd.panoply": {
	source: "iana"
},
	"application/vnd.paos.xml": {
	source: "iana"
},
	"application/vnd.patentdive": {
	source: "iana"
},
	"application/vnd.patientecommsdoc": {
	source: "iana"
},
	"application/vnd.pawaafile": {
	source: "iana",
	extensions: [
		"paw"
	]
},
	"application/vnd.pcos": {
	source: "iana"
},
	"application/vnd.pg.format": {
	source: "iana",
	extensions: [
		"str"
	]
},
	"application/vnd.pg.osasli": {
	source: "iana",
	extensions: [
		"ei6"
	]
},
	"application/vnd.piaccess.application-licence": {
	source: "iana"
},
	"application/vnd.picsel": {
	source: "iana",
	extensions: [
		"efif"
	]
},
	"application/vnd.pmi.widget": {
	source: "iana",
	extensions: [
		"wg"
	]
},
	"application/vnd.poc.group-advertisement+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.pocketlearn": {
	source: "iana",
	extensions: [
		"plf"
	]
},
	"application/vnd.powerbuilder6": {
	source: "iana",
	extensions: [
		"pbd"
	]
},
	"application/vnd.powerbuilder6-s": {
	source: "iana"
},
	"application/vnd.powerbuilder7": {
	source: "iana"
},
	"application/vnd.powerbuilder7-s": {
	source: "iana"
},
	"application/vnd.powerbuilder75": {
	source: "iana"
},
	"application/vnd.powerbuilder75-s": {
	source: "iana"
},
	"application/vnd.preminet": {
	source: "iana"
},
	"application/vnd.previewsystems.box": {
	source: "iana",
	extensions: [
		"box"
	]
},
	"application/vnd.proteus.magazine": {
	source: "iana",
	extensions: [
		"mgz"
	]
},
	"application/vnd.psfs": {
	source: "iana"
},
	"application/vnd.pt.mundusmundi": {
	source: "iana"
},
	"application/vnd.publishare-delta-tree": {
	source: "iana",
	extensions: [
		"qps"
	]
},
	"application/vnd.pvi.ptid1": {
	source: "iana",
	extensions: [
		"ptid"
	]
},
	"application/vnd.pwg-multiplexed": {
	source: "iana"
},
	"application/vnd.pwg-xhtml-print+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xhtm"
	]
},
	"application/vnd.qualcomm.brew-app-res": {
	source: "iana"
},
	"application/vnd.quarantainenet": {
	source: "iana"
},
	"application/vnd.quark.quarkxpress": {
	source: "iana",
	extensions: [
		"qxd",
		"qxt",
		"qwd",
		"qwt",
		"qxl",
		"qxb"
	]
},
	"application/vnd.quobject-quoxdocument": {
	source: "iana"
},
	"application/vnd.radisys.moml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-conf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-conn+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-dialog+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-audit-stream+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-conf+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-base+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-fax-detect+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-group+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-speech+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.radisys.msml-dialog-transform+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.rainstor.data": {
	source: "iana"
},
	"application/vnd.rapid": {
	source: "iana"
},
	"application/vnd.rar": {
	source: "iana",
	extensions: [
		"rar"
	]
},
	"application/vnd.realvnc.bed": {
	source: "iana",
	extensions: [
		"bed"
	]
},
	"application/vnd.recordare.musicxml": {
	source: "iana",
	extensions: [
		"mxl"
	]
},
	"application/vnd.recordare.musicxml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"musicxml"
	]
},
	"application/vnd.relpipe": {
	source: "iana"
},
	"application/vnd.renlearn.rlprint": {
	source: "iana"
},
	"application/vnd.resilient.logic": {
	source: "iana"
},
	"application/vnd.restful+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.rig.cryptonote": {
	source: "iana",
	extensions: [
		"cryptonote"
	]
},
	"application/vnd.rim.cod": {
	source: "apache",
	extensions: [
		"cod"
	]
},
	"application/vnd.rn-realmedia": {
	source: "apache",
	extensions: [
		"rm"
	]
},
	"application/vnd.rn-realmedia-vbr": {
	source: "apache",
	extensions: [
		"rmvb"
	]
},
	"application/vnd.route66.link66+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"link66"
	]
},
	"application/vnd.rs-274x": {
	source: "iana"
},
	"application/vnd.ruckus.download": {
	source: "iana"
},
	"application/vnd.s3sms": {
	source: "iana"
},
	"application/vnd.sailingtracker.track": {
	source: "iana",
	extensions: [
		"st"
	]
},
	"application/vnd.sar": {
	source: "iana"
},
	"application/vnd.sbm.cid": {
	source: "iana"
},
	"application/vnd.sbm.mid2": {
	source: "iana"
},
	"application/vnd.scribus": {
	source: "iana"
},
	"application/vnd.sealed.3df": {
	source: "iana"
},
	"application/vnd.sealed.csf": {
	source: "iana"
},
	"application/vnd.sealed.doc": {
	source: "iana"
},
	"application/vnd.sealed.eml": {
	source: "iana"
},
	"application/vnd.sealed.mht": {
	source: "iana"
},
	"application/vnd.sealed.net": {
	source: "iana"
},
	"application/vnd.sealed.ppt": {
	source: "iana"
},
	"application/vnd.sealed.tiff": {
	source: "iana"
},
	"application/vnd.sealed.xls": {
	source: "iana"
},
	"application/vnd.sealedmedia.softseal.html": {
	source: "iana"
},
	"application/vnd.sealedmedia.softseal.pdf": {
	source: "iana"
},
	"application/vnd.seemail": {
	source: "iana",
	extensions: [
		"see"
	]
},
	"application/vnd.seis+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.sema": {
	source: "iana",
	extensions: [
		"sema"
	]
},
	"application/vnd.semd": {
	source: "iana",
	extensions: [
		"semd"
	]
},
	"application/vnd.semf": {
	source: "iana",
	extensions: [
		"semf"
	]
},
	"application/vnd.shade-save-file": {
	source: "iana"
},
	"application/vnd.shana.informed.formdata": {
	source: "iana",
	extensions: [
		"ifm"
	]
},
	"application/vnd.shana.informed.formtemplate": {
	source: "iana",
	extensions: [
		"itp"
	]
},
	"application/vnd.shana.informed.interchange": {
	source: "iana",
	extensions: [
		"iif"
	]
},
	"application/vnd.shana.informed.package": {
	source: "iana",
	extensions: [
		"ipk"
	]
},
	"application/vnd.shootproof+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.shopkick+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.shp": {
	source: "iana"
},
	"application/vnd.shx": {
	source: "iana"
},
	"application/vnd.sigrok.session": {
	source: "iana"
},
	"application/vnd.simtech-mindmapper": {
	source: "iana",
	extensions: [
		"twd",
		"twds"
	]
},
	"application/vnd.siren+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.smaf": {
	source: "iana",
	extensions: [
		"mmf"
	]
},
	"application/vnd.smart.notebook": {
	source: "iana"
},
	"application/vnd.smart.teacher": {
	source: "iana",
	extensions: [
		"teacher"
	]
},
	"application/vnd.smintio.portals.archive": {
	source: "iana"
},
	"application/vnd.snesdev-page-table": {
	source: "iana"
},
	"application/vnd.software602.filler.form+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"fo"
	]
},
	"application/vnd.software602.filler.form-xml-zip": {
	source: "iana"
},
	"application/vnd.solent.sdkm+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"sdkm",
		"sdkd"
	]
},
	"application/vnd.spotfire.dxp": {
	source: "iana",
	extensions: [
		"dxp"
	]
},
	"application/vnd.spotfire.sfs": {
	source: "iana",
	extensions: [
		"sfs"
	]
},
	"application/vnd.sqlite3": {
	source: "iana"
},
	"application/vnd.sss-cod": {
	source: "iana"
},
	"application/vnd.sss-dtf": {
	source: "iana"
},
	"application/vnd.sss-ntf": {
	source: "iana"
},
	"application/vnd.stardivision.calc": {
	source: "apache",
	extensions: [
		"sdc"
	]
},
	"application/vnd.stardivision.draw": {
	source: "apache",
	extensions: [
		"sda"
	]
},
	"application/vnd.stardivision.impress": {
	source: "apache",
	extensions: [
		"sdd"
	]
},
	"application/vnd.stardivision.math": {
	source: "apache",
	extensions: [
		"smf"
	]
},
	"application/vnd.stardivision.writer": {
	source: "apache",
	extensions: [
		"sdw",
		"vor"
	]
},
	"application/vnd.stardivision.writer-global": {
	source: "apache",
	extensions: [
		"sgl"
	]
},
	"application/vnd.stepmania.package": {
	source: "iana",
	extensions: [
		"smzip"
	]
},
	"application/vnd.stepmania.stepchart": {
	source: "iana",
	extensions: [
		"sm"
	]
},
	"application/vnd.street-stream": {
	source: "iana"
},
	"application/vnd.sun.wadl+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wadl"
	]
},
	"application/vnd.sun.xml.calc": {
	source: "apache",
	extensions: [
		"sxc"
	]
},
	"application/vnd.sun.xml.calc.template": {
	source: "apache",
	extensions: [
		"stc"
	]
},
	"application/vnd.sun.xml.draw": {
	source: "apache",
	extensions: [
		"sxd"
	]
},
	"application/vnd.sun.xml.draw.template": {
	source: "apache",
	extensions: [
		"std"
	]
},
	"application/vnd.sun.xml.impress": {
	source: "apache",
	extensions: [
		"sxi"
	]
},
	"application/vnd.sun.xml.impress.template": {
	source: "apache",
	extensions: [
		"sti"
	]
},
	"application/vnd.sun.xml.math": {
	source: "apache",
	extensions: [
		"sxm"
	]
},
	"application/vnd.sun.xml.writer": {
	source: "apache",
	extensions: [
		"sxw"
	]
},
	"application/vnd.sun.xml.writer.global": {
	source: "apache",
	extensions: [
		"sxg"
	]
},
	"application/vnd.sun.xml.writer.template": {
	source: "apache",
	extensions: [
		"stw"
	]
},
	"application/vnd.sus-calendar": {
	source: "iana",
	extensions: [
		"sus",
		"susp"
	]
},
	"application/vnd.svd": {
	source: "iana",
	extensions: [
		"svd"
	]
},
	"application/vnd.swiftview-ics": {
	source: "iana"
},
	"application/vnd.sybyl.mol2": {
	source: "iana"
},
	"application/vnd.sycle+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.syft+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.symbian.install": {
	source: "apache",
	extensions: [
		"sis",
		"sisx"
	]
},
	"application/vnd.syncml+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"xsm"
	]
},
	"application/vnd.syncml.dm+wbxml": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"bdm"
	]
},
	"application/vnd.syncml.dm+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"xdm"
	]
},
	"application/vnd.syncml.dm.notification": {
	source: "iana"
},
	"application/vnd.syncml.dmddf+wbxml": {
	source: "iana"
},
	"application/vnd.syncml.dmddf+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"ddf"
	]
},
	"application/vnd.syncml.dmtnds+wbxml": {
	source: "iana"
},
	"application/vnd.syncml.dmtnds+xml": {
	source: "iana",
	charset: "UTF-8",
	compressible: true
},
	"application/vnd.syncml.ds.notification": {
	source: "iana"
},
	"application/vnd.tableschema+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.tao.intent-module-archive": {
	source: "iana",
	extensions: [
		"tao"
	]
},
	"application/vnd.tcpdump.pcap": {
	source: "iana",
	extensions: [
		"pcap",
		"cap",
		"dmp"
	]
},
	"application/vnd.think-cell.ppttc+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.tmd.mediaflex.api+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.tml": {
	source: "iana"
},
	"application/vnd.tmobile-livetv": {
	source: "iana",
	extensions: [
		"tmo"
	]
},
	"application/vnd.tri.onesource": {
	source: "iana"
},
	"application/vnd.trid.tpt": {
	source: "iana",
	extensions: [
		"tpt"
	]
},
	"application/vnd.triscape.mxs": {
	source: "iana",
	extensions: [
		"mxs"
	]
},
	"application/vnd.trueapp": {
	source: "iana",
	extensions: [
		"tra"
	]
},
	"application/vnd.truedoc": {
	source: "iana"
},
	"application/vnd.ubisoft.webplayer": {
	source: "iana"
},
	"application/vnd.ufdl": {
	source: "iana",
	extensions: [
		"ufd",
		"ufdl"
	]
},
	"application/vnd.uiq.theme": {
	source: "iana",
	extensions: [
		"utz"
	]
},
	"application/vnd.umajin": {
	source: "iana",
	extensions: [
		"umj"
	]
},
	"application/vnd.unity": {
	source: "iana",
	extensions: [
		"unityweb"
	]
},
	"application/vnd.uoml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"uoml",
		"uo"
	]
},
	"application/vnd.uplanet.alert": {
	source: "iana"
},
	"application/vnd.uplanet.alert-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.bearer-choice": {
	source: "iana"
},
	"application/vnd.uplanet.bearer-choice-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.cacheop": {
	source: "iana"
},
	"application/vnd.uplanet.cacheop-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.channel": {
	source: "iana"
},
	"application/vnd.uplanet.channel-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.list": {
	source: "iana"
},
	"application/vnd.uplanet.list-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.listcmd": {
	source: "iana"
},
	"application/vnd.uplanet.listcmd-wbxml": {
	source: "iana"
},
	"application/vnd.uplanet.signal": {
	source: "iana"
},
	"application/vnd.uri-map": {
	source: "iana"
},
	"application/vnd.valve.source.material": {
	source: "iana"
},
	"application/vnd.vcx": {
	source: "iana",
	extensions: [
		"vcx"
	]
},
	"application/vnd.vd-study": {
	source: "iana"
},
	"application/vnd.vectorworks": {
	source: "iana"
},
	"application/vnd.vel+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.verimatrix.vcas": {
	source: "iana"
},
	"application/vnd.veritone.aion+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.veryant.thin": {
	source: "iana"
},
	"application/vnd.ves.encrypted": {
	source: "iana"
},
	"application/vnd.vidsoft.vidconference": {
	source: "iana"
},
	"application/vnd.visio": {
	source: "iana",
	extensions: [
		"vsd",
		"vst",
		"vss",
		"vsw"
	]
},
	"application/vnd.visionary": {
	source: "iana",
	extensions: [
		"vis"
	]
},
	"application/vnd.vividence.scriptfile": {
	source: "iana"
},
	"application/vnd.vsf": {
	source: "iana",
	extensions: [
		"vsf"
	]
},
	"application/vnd.wap.sic": {
	source: "iana"
},
	"application/vnd.wap.slc": {
	source: "iana"
},
	"application/vnd.wap.wbxml": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"wbxml"
	]
},
	"application/vnd.wap.wmlc": {
	source: "iana",
	extensions: [
		"wmlc"
	]
},
	"application/vnd.wap.wmlscriptc": {
	source: "iana",
	extensions: [
		"wmlsc"
	]
},
	"application/vnd.wasmflow.wafl": {
	source: "iana"
},
	"application/vnd.webturbo": {
	source: "iana",
	extensions: [
		"wtb"
	]
},
	"application/vnd.wfa.dpp": {
	source: "iana"
},
	"application/vnd.wfa.p2p": {
	source: "iana"
},
	"application/vnd.wfa.wsc": {
	source: "iana"
},
	"application/vnd.windows.devicepairing": {
	source: "iana"
},
	"application/vnd.wmc": {
	source: "iana"
},
	"application/vnd.wmf.bootstrap": {
	source: "iana"
},
	"application/vnd.wolfram.mathematica": {
	source: "iana"
},
	"application/vnd.wolfram.mathematica.package": {
	source: "iana"
},
	"application/vnd.wolfram.player": {
	source: "iana",
	extensions: [
		"nbp"
	]
},
	"application/vnd.wordlift": {
	source: "iana"
},
	"application/vnd.wordperfect": {
	source: "iana",
	extensions: [
		"wpd"
	]
},
	"application/vnd.wqd": {
	source: "iana",
	extensions: [
		"wqd"
	]
},
	"application/vnd.wrq-hp3000-labelled": {
	source: "iana"
},
	"application/vnd.wt.stf": {
	source: "iana",
	extensions: [
		"stf"
	]
},
	"application/vnd.wv.csp+wbxml": {
	source: "iana"
},
	"application/vnd.wv.csp+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.wv.ssp+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.xacml+json": {
	source: "iana",
	compressible: true
},
	"application/vnd.xara": {
	source: "iana",
	extensions: [
		"xar"
	]
},
	"application/vnd.xecrets-encrypted": {
	source: "iana"
},
	"application/vnd.xfdl": {
	source: "iana",
	extensions: [
		"xfdl"
	]
},
	"application/vnd.xfdl.webform": {
	source: "iana"
},
	"application/vnd.xmi+xml": {
	source: "iana",
	compressible: true
},
	"application/vnd.xmpie.cpkg": {
	source: "iana"
},
	"application/vnd.xmpie.dpkg": {
	source: "iana"
},
	"application/vnd.xmpie.plan": {
	source: "iana"
},
	"application/vnd.xmpie.ppkg": {
	source: "iana"
},
	"application/vnd.xmpie.xlim": {
	source: "iana"
},
	"application/vnd.yamaha.hv-dic": {
	source: "iana",
	extensions: [
		"hvd"
	]
},
	"application/vnd.yamaha.hv-script": {
	source: "iana",
	extensions: [
		"hvs"
	]
},
	"application/vnd.yamaha.hv-voice": {
	source: "iana",
	extensions: [
		"hvp"
	]
},
	"application/vnd.yamaha.openscoreformat": {
	source: "iana",
	extensions: [
		"osf"
	]
},
	"application/vnd.yamaha.openscoreformat.osfpvg+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"osfpvg"
	]
},
	"application/vnd.yamaha.remote-setup": {
	source: "iana"
},
	"application/vnd.yamaha.smaf-audio": {
	source: "iana",
	extensions: [
		"saf"
	]
},
	"application/vnd.yamaha.smaf-phrase": {
	source: "iana",
	extensions: [
		"spf"
	]
},
	"application/vnd.yamaha.through-ngn": {
	source: "iana"
},
	"application/vnd.yamaha.tunnel-udpencap": {
	source: "iana"
},
	"application/vnd.yaoweme": {
	source: "iana"
},
	"application/vnd.yellowriver-custom-menu": {
	source: "iana",
	extensions: [
		"cmp"
	]
},
	"application/vnd.zul": {
	source: "iana",
	extensions: [
		"zir",
		"zirz"
	]
},
	"application/vnd.zzazz.deck+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"zaz"
	]
},
	"application/voicexml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"vxml"
	]
},
	"application/voucher-cms+json": {
	source: "iana",
	compressible: true
},
	"application/vp": {
	source: "iana"
},
	"application/vq-rtcpxr": {
	source: "iana"
},
	"application/wasm": {
	source: "iana",
	compressible: true,
	extensions: [
		"wasm"
	]
},
	"application/watcherinfo+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wif"
	]
},
	"application/webpush-options+json": {
	source: "iana",
	compressible: true
},
	"application/whoispp-query": {
	source: "iana"
},
	"application/whoispp-response": {
	source: "iana"
},
	"application/widget": {
	source: "iana",
	extensions: [
		"wgt"
	]
},
	"application/winhlp": {
	source: "apache",
	extensions: [
		"hlp"
	]
},
	"application/wita": {
	source: "iana"
},
	"application/wordperfect5.1": {
	source: "iana"
},
	"application/wsdl+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wsdl"
	]
},
	"application/wspolicy+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"wspolicy"
	]
},
	"application/x-7z-compressed": {
	source: "apache",
	compressible: false,
	extensions: [
		"7z"
	]
},
	"application/x-abiword": {
	source: "apache",
	extensions: [
		"abw"
	]
},
	"application/x-ace-compressed": {
	source: "apache",
	extensions: [
		"ace"
	]
},
	"application/x-amf": {
	source: "apache"
},
	"application/x-apple-diskimage": {
	source: "apache",
	extensions: [
		"dmg"
	]
},
	"application/x-arj": {
	compressible: false,
	extensions: [
		"arj"
	]
},
	"application/x-authorware-bin": {
	source: "apache",
	extensions: [
		"aab",
		"x32",
		"u32",
		"vox"
	]
},
	"application/x-authorware-map": {
	source: "apache",
	extensions: [
		"aam"
	]
},
	"application/x-authorware-seg": {
	source: "apache",
	extensions: [
		"aas"
	]
},
	"application/x-bcpio": {
	source: "apache",
	extensions: [
		"bcpio"
	]
},
	"application/x-bdoc": {
	compressible: false,
	extensions: [
		"bdoc"
	]
},
	"application/x-bittorrent": {
	source: "apache",
	extensions: [
		"torrent"
	]
},
	"application/x-blorb": {
	source: "apache",
	extensions: [
		"blb",
		"blorb"
	]
},
	"application/x-bzip": {
	source: "apache",
	compressible: false,
	extensions: [
		"bz"
	]
},
	"application/x-bzip2": {
	source: "apache",
	compressible: false,
	extensions: [
		"bz2",
		"boz"
	]
},
	"application/x-cbr": {
	source: "apache",
	extensions: [
		"cbr",
		"cba",
		"cbt",
		"cbz",
		"cb7"
	]
},
	"application/x-cdlink": {
	source: "apache",
	extensions: [
		"vcd"
	]
},
	"application/x-cfs-compressed": {
	source: "apache",
	extensions: [
		"cfs"
	]
},
	"application/x-chat": {
	source: "apache",
	extensions: [
		"chat"
	]
},
	"application/x-chess-pgn": {
	source: "apache",
	extensions: [
		"pgn"
	]
},
	"application/x-chrome-extension": {
	extensions: [
		"crx"
	]
},
	"application/x-cocoa": {
	source: "nginx",
	extensions: [
		"cco"
	]
},
	"application/x-compress": {
	source: "apache"
},
	"application/x-conference": {
	source: "apache",
	extensions: [
		"nsc"
	]
},
	"application/x-cpio": {
	source: "apache",
	extensions: [
		"cpio"
	]
},
	"application/x-csh": {
	source: "apache",
	extensions: [
		"csh"
	]
},
	"application/x-deb": {
	compressible: false
},
	"application/x-debian-package": {
	source: "apache",
	extensions: [
		"deb",
		"udeb"
	]
},
	"application/x-dgc-compressed": {
	source: "apache",
	extensions: [
		"dgc"
	]
},
	"application/x-director": {
	source: "apache",
	extensions: [
		"dir",
		"dcr",
		"dxr",
		"cst",
		"cct",
		"cxt",
		"w3d",
		"fgd",
		"swa"
	]
},
	"application/x-doom": {
	source: "apache",
	extensions: [
		"wad"
	]
},
	"application/x-dtbncx+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"ncx"
	]
},
	"application/x-dtbook+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"dtb"
	]
},
	"application/x-dtbresource+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"res"
	]
},
	"application/x-dvi": {
	source: "apache",
	compressible: false,
	extensions: [
		"dvi"
	]
},
	"application/x-envoy": {
	source: "apache",
	extensions: [
		"evy"
	]
},
	"application/x-eva": {
	source: "apache",
	extensions: [
		"eva"
	]
},
	"application/x-font-bdf": {
	source: "apache",
	extensions: [
		"bdf"
	]
},
	"application/x-font-dos": {
	source: "apache"
},
	"application/x-font-framemaker": {
	source: "apache"
},
	"application/x-font-ghostscript": {
	source: "apache",
	extensions: [
		"gsf"
	]
},
	"application/x-font-libgrx": {
	source: "apache"
},
	"application/x-font-linux-psf": {
	source: "apache",
	extensions: [
		"psf"
	]
},
	"application/x-font-pcf": {
	source: "apache",
	extensions: [
		"pcf"
	]
},
	"application/x-font-snf": {
	source: "apache",
	extensions: [
		"snf"
	]
},
	"application/x-font-speedo": {
	source: "apache"
},
	"application/x-font-sunos-news": {
	source: "apache"
},
	"application/x-font-type1": {
	source: "apache",
	extensions: [
		"pfa",
		"pfb",
		"pfm",
		"afm"
	]
},
	"application/x-font-vfont": {
	source: "apache"
},
	"application/x-freearc": {
	source: "apache",
	extensions: [
		"arc"
	]
},
	"application/x-futuresplash": {
	source: "apache",
	extensions: [
		"spl"
	]
},
	"application/x-gca-compressed": {
	source: "apache",
	extensions: [
		"gca"
	]
},
	"application/x-glulx": {
	source: "apache",
	extensions: [
		"ulx"
	]
},
	"application/x-gnumeric": {
	source: "apache",
	extensions: [
		"gnumeric"
	]
},
	"application/x-gramps-xml": {
	source: "apache",
	extensions: [
		"gramps"
	]
},
	"application/x-gtar": {
	source: "apache",
	extensions: [
		"gtar"
	]
},
	"application/x-gzip": {
	source: "apache"
},
	"application/x-hdf": {
	source: "apache",
	extensions: [
		"hdf"
	]
},
	"application/x-httpd-php": {
	compressible: true,
	extensions: [
		"php"
	]
},
	"application/x-install-instructions": {
	source: "apache",
	extensions: [
		"install"
	]
},
	"application/x-iso9660-image": {
	source: "apache",
	extensions: [
		"iso"
	]
},
	"application/x-iwork-keynote-sffkey": {
	extensions: [
		"key"
	]
},
	"application/x-iwork-numbers-sffnumbers": {
	extensions: [
		"numbers"
	]
},
	"application/x-iwork-pages-sffpages": {
	extensions: [
		"pages"
	]
},
	"application/x-java-archive-diff": {
	source: "nginx",
	extensions: [
		"jardiff"
	]
},
	"application/x-java-jnlp-file": {
	source: "apache",
	compressible: false,
	extensions: [
		"jnlp"
	]
},
	"application/x-javascript": {
	compressible: true
},
	"application/x-keepass2": {
	extensions: [
		"kdbx"
	]
},
	"application/x-latex": {
	source: "apache",
	compressible: false,
	extensions: [
		"latex"
	]
},
	"application/x-lua-bytecode": {
	extensions: [
		"luac"
	]
},
	"application/x-lzh-compressed": {
	source: "apache",
	extensions: [
		"lzh",
		"lha"
	]
},
	"application/x-makeself": {
	source: "nginx",
	extensions: [
		"run"
	]
},
	"application/x-mie": {
	source: "apache",
	extensions: [
		"mie"
	]
},
	"application/x-mobipocket-ebook": {
	source: "apache",
	extensions: [
		"prc",
		"mobi"
	]
},
	"application/x-mpegurl": {
	compressible: false
},
	"application/x-ms-application": {
	source: "apache",
	extensions: [
		"application"
	]
},
	"application/x-ms-shortcut": {
	source: "apache",
	extensions: [
		"lnk"
	]
},
	"application/x-ms-wmd": {
	source: "apache",
	extensions: [
		"wmd"
	]
},
	"application/x-ms-wmz": {
	source: "apache",
	extensions: [
		"wmz"
	]
},
	"application/x-ms-xbap": {
	source: "apache",
	extensions: [
		"xbap"
	]
},
	"application/x-msaccess": {
	source: "apache",
	extensions: [
		"mdb"
	]
},
	"application/x-msbinder": {
	source: "apache",
	extensions: [
		"obd"
	]
},
	"application/x-mscardfile": {
	source: "apache",
	extensions: [
		"crd"
	]
},
	"application/x-msclip": {
	source: "apache",
	extensions: [
		"clp"
	]
},
	"application/x-msdos-program": {
	extensions: [
		"exe"
	]
},
	"application/x-msdownload": {
	source: "apache",
	extensions: [
		"exe",
		"dll",
		"com",
		"bat",
		"msi"
	]
},
	"application/x-msmediaview": {
	source: "apache",
	extensions: [
		"mvb",
		"m13",
		"m14"
	]
},
	"application/x-msmetafile": {
	source: "apache",
	extensions: [
		"wmf",
		"wmz",
		"emf",
		"emz"
	]
},
	"application/x-msmoney": {
	source: "apache",
	extensions: [
		"mny"
	]
},
	"application/x-mspublisher": {
	source: "apache",
	extensions: [
		"pub"
	]
},
	"application/x-msschedule": {
	source: "apache",
	extensions: [
		"scd"
	]
},
	"application/x-msterminal": {
	source: "apache",
	extensions: [
		"trm"
	]
},
	"application/x-mswrite": {
	source: "apache",
	extensions: [
		"wri"
	]
},
	"application/x-netcdf": {
	source: "apache",
	extensions: [
		"nc",
		"cdf"
	]
},
	"application/x-ns-proxy-autoconfig": {
	compressible: true,
	extensions: [
		"pac"
	]
},
	"application/x-nzb": {
	source: "apache",
	extensions: [
		"nzb"
	]
},
	"application/x-perl": {
	source: "nginx",
	extensions: [
		"pl",
		"pm"
	]
},
	"application/x-pilot": {
	source: "nginx",
	extensions: [
		"prc",
		"pdb"
	]
},
	"application/x-pkcs12": {
	source: "apache",
	compressible: false,
	extensions: [
		"p12",
		"pfx"
	]
},
	"application/x-pkcs7-certificates": {
	source: "apache",
	extensions: [
		"p7b",
		"spc"
	]
},
	"application/x-pkcs7-certreqresp": {
	source: "apache",
	extensions: [
		"p7r"
	]
},
	"application/x-pki-message": {
	source: "iana"
},
	"application/x-rar-compressed": {
	source: "apache",
	compressible: false,
	extensions: [
		"rar"
	]
},
	"application/x-redhat-package-manager": {
	source: "nginx",
	extensions: [
		"rpm"
	]
},
	"application/x-research-info-systems": {
	source: "apache",
	extensions: [
		"ris"
	]
},
	"application/x-sea": {
	source: "nginx",
	extensions: [
		"sea"
	]
},
	"application/x-sh": {
	source: "apache",
	compressible: true,
	extensions: [
		"sh"
	]
},
	"application/x-shar": {
	source: "apache",
	extensions: [
		"shar"
	]
},
	"application/x-shockwave-flash": {
	source: "apache",
	compressible: false,
	extensions: [
		"swf"
	]
},
	"application/x-silverlight-app": {
	source: "apache",
	extensions: [
		"xap"
	]
},
	"application/x-sql": {
	source: "apache",
	extensions: [
		"sql"
	]
},
	"application/x-stuffit": {
	source: "apache",
	compressible: false,
	extensions: [
		"sit"
	]
},
	"application/x-stuffitx": {
	source: "apache",
	extensions: [
		"sitx"
	]
},
	"application/x-subrip": {
	source: "apache",
	extensions: [
		"srt"
	]
},
	"application/x-sv4cpio": {
	source: "apache",
	extensions: [
		"sv4cpio"
	]
},
	"application/x-sv4crc": {
	source: "apache",
	extensions: [
		"sv4crc"
	]
},
	"application/x-t3vm-image": {
	source: "apache",
	extensions: [
		"t3"
	]
},
	"application/x-tads": {
	source: "apache",
	extensions: [
		"gam"
	]
},
	"application/x-tar": {
	source: "apache",
	compressible: true,
	extensions: [
		"tar"
	]
},
	"application/x-tcl": {
	source: "apache",
	extensions: [
		"tcl",
		"tk"
	]
},
	"application/x-tex": {
	source: "apache",
	extensions: [
		"tex"
	]
},
	"application/x-tex-tfm": {
	source: "apache",
	extensions: [
		"tfm"
	]
},
	"application/x-texinfo": {
	source: "apache",
	extensions: [
		"texinfo",
		"texi"
	]
},
	"application/x-tgif": {
	source: "apache",
	extensions: [
		"obj"
	]
},
	"application/x-ustar": {
	source: "apache",
	extensions: [
		"ustar"
	]
},
	"application/x-virtualbox-hdd": {
	compressible: true,
	extensions: [
		"hdd"
	]
},
	"application/x-virtualbox-ova": {
	compressible: true,
	extensions: [
		"ova"
	]
},
	"application/x-virtualbox-ovf": {
	compressible: true,
	extensions: [
		"ovf"
	]
},
	"application/x-virtualbox-vbox": {
	compressible: true,
	extensions: [
		"vbox"
	]
},
	"application/x-virtualbox-vbox-extpack": {
	compressible: false,
	extensions: [
		"vbox-extpack"
	]
},
	"application/x-virtualbox-vdi": {
	compressible: true,
	extensions: [
		"vdi"
	]
},
	"application/x-virtualbox-vhd": {
	compressible: true,
	extensions: [
		"vhd"
	]
},
	"application/x-virtualbox-vmdk": {
	compressible: true,
	extensions: [
		"vmdk"
	]
},
	"application/x-wais-source": {
	source: "apache",
	extensions: [
		"src"
	]
},
	"application/x-web-app-manifest+json": {
	compressible: true,
	extensions: [
		"webapp"
	]
},
	"application/x-www-form-urlencoded": {
	source: "iana",
	compressible: true
},
	"application/x-x509-ca-cert": {
	source: "iana",
	extensions: [
		"der",
		"crt",
		"pem"
	]
},
	"application/x-x509-ca-ra-cert": {
	source: "iana"
},
	"application/x-x509-next-ca-cert": {
	source: "iana"
},
	"application/x-xfig": {
	source: "apache",
	extensions: [
		"fig"
	]
},
	"application/x-xliff+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xlf"
	]
},
	"application/x-xpinstall": {
	source: "apache",
	compressible: false,
	extensions: [
		"xpi"
	]
},
	"application/x-xz": {
	source: "apache",
	extensions: [
		"xz"
	]
},
	"application/x-zmachine": {
	source: "apache",
	extensions: [
		"z1",
		"z2",
		"z3",
		"z4",
		"z5",
		"z6",
		"z7",
		"z8"
	]
},
	"application/x400-bp": {
	source: "iana"
},
	"application/xacml+xml": {
	source: "iana",
	compressible: true
},
	"application/xaml+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xaml"
	]
},
	"application/xcap-att+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xav"
	]
},
	"application/xcap-caps+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xca"
	]
},
	"application/xcap-diff+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xdf"
	]
},
	"application/xcap-el+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xel"
	]
},
	"application/xcap-error+xml": {
	source: "iana",
	compressible: true
},
	"application/xcap-ns+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xns"
	]
},
	"application/xcon-conference-info+xml": {
	source: "iana",
	compressible: true
},
	"application/xcon-conference-info-diff+xml": {
	source: "iana",
	compressible: true
},
	"application/xenc+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xenc"
	]
},
	"application/xfdf": {
	source: "iana",
	extensions: [
		"xfdf"
	]
},
	"application/xhtml+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xhtml",
		"xht"
	]
},
	"application/xhtml-voice+xml": {
	source: "apache",
	compressible: true
},
	"application/xliff+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xlf"
	]
},
	"application/xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xml",
		"xsl",
		"xsd",
		"rng"
	]
},
	"application/xml-dtd": {
	source: "iana",
	compressible: true,
	extensions: [
		"dtd"
	]
},
	"application/xml-external-parsed-entity": {
	source: "iana"
},
	"application/xml-patch+xml": {
	source: "iana",
	compressible: true
},
	"application/xmpp+xml": {
	source: "iana",
	compressible: true
},
	"application/xop+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xop"
	]
},
	"application/xproc+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xpl"
	]
},
	"application/xslt+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xsl",
		"xslt"
	]
},
	"application/xspf+xml": {
	source: "apache",
	compressible: true,
	extensions: [
		"xspf"
	]
},
	"application/xv+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"mxml",
		"xhvml",
		"xvml",
		"xvm"
	]
},
	"application/yaml": {
	source: "iana"
},
	"application/yang": {
	source: "iana",
	extensions: [
		"yang"
	]
},
	"application/yang-data+cbor": {
	source: "iana"
},
	"application/yang-data+json": {
	source: "iana",
	compressible: true
},
	"application/yang-data+xml": {
	source: "iana",
	compressible: true
},
	"application/yang-patch+json": {
	source: "iana",
	compressible: true
},
	"application/yang-patch+xml": {
	source: "iana",
	compressible: true
},
	"application/yang-sid+json": {
	source: "iana",
	compressible: true
},
	"application/yin+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"yin"
	]
},
	"application/zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"zip"
	]
},
	"application/zlib": {
	source: "iana"
},
	"application/zstd": {
	source: "iana"
},
	"audio/1d-interleaved-parityfec": {
	source: "iana"
},
	"audio/32kadpcm": {
	source: "iana"
},
	"audio/3gpp": {
	source: "iana",
	compressible: false,
	extensions: [
		"3gpp"
	]
},
	"audio/3gpp2": {
	source: "iana"
},
	"audio/aac": {
	source: "iana",
	extensions: [
		"adts",
		"aac"
	]
},
	"audio/ac3": {
	source: "iana"
},
	"audio/adpcm": {
	source: "apache",
	extensions: [
		"adp"
	]
},
	"audio/amr": {
	source: "iana",
	extensions: [
		"amr"
	]
},
	"audio/amr-wb": {
	source: "iana"
},
	"audio/amr-wb+": {
	source: "iana"
},
	"audio/aptx": {
	source: "iana"
},
	"audio/asc": {
	source: "iana"
},
	"audio/atrac-advanced-lossless": {
	source: "iana"
},
	"audio/atrac-x": {
	source: "iana"
},
	"audio/atrac3": {
	source: "iana"
},
	"audio/basic": {
	source: "iana",
	compressible: false,
	extensions: [
		"au",
		"snd"
	]
},
	"audio/bv16": {
	source: "iana"
},
	"audio/bv32": {
	source: "iana"
},
	"audio/clearmode": {
	source: "iana"
},
	"audio/cn": {
	source: "iana"
},
	"audio/dat12": {
	source: "iana"
},
	"audio/dls": {
	source: "iana"
},
	"audio/dsr-es201108": {
	source: "iana"
},
	"audio/dsr-es202050": {
	source: "iana"
},
	"audio/dsr-es202211": {
	source: "iana"
},
	"audio/dsr-es202212": {
	source: "iana"
},
	"audio/dv": {
	source: "iana"
},
	"audio/dvi4": {
	source: "iana"
},
	"audio/eac3": {
	source: "iana"
},
	"audio/encaprtp": {
	source: "iana"
},
	"audio/evrc": {
	source: "iana"
},
	"audio/evrc-qcp": {
	source: "iana"
},
	"audio/evrc0": {
	source: "iana"
},
	"audio/evrc1": {
	source: "iana"
},
	"audio/evrcb": {
	source: "iana"
},
	"audio/evrcb0": {
	source: "iana"
},
	"audio/evrcb1": {
	source: "iana"
},
	"audio/evrcnw": {
	source: "iana"
},
	"audio/evrcnw0": {
	source: "iana"
},
	"audio/evrcnw1": {
	source: "iana"
},
	"audio/evrcwb": {
	source: "iana"
},
	"audio/evrcwb0": {
	source: "iana"
},
	"audio/evrcwb1": {
	source: "iana"
},
	"audio/evs": {
	source: "iana"
},
	"audio/flac": {
	source: "iana"
},
	"audio/flexfec": {
	source: "iana"
},
	"audio/fwdred": {
	source: "iana"
},
	"audio/g711-0": {
	source: "iana"
},
	"audio/g719": {
	source: "iana"
},
	"audio/g722": {
	source: "iana"
},
	"audio/g7221": {
	source: "iana"
},
	"audio/g723": {
	source: "iana"
},
	"audio/g726-16": {
	source: "iana"
},
	"audio/g726-24": {
	source: "iana"
},
	"audio/g726-32": {
	source: "iana"
},
	"audio/g726-40": {
	source: "iana"
},
	"audio/g728": {
	source: "iana"
},
	"audio/g729": {
	source: "iana"
},
	"audio/g7291": {
	source: "iana"
},
	"audio/g729d": {
	source: "iana"
},
	"audio/g729e": {
	source: "iana"
},
	"audio/gsm": {
	source: "iana"
},
	"audio/gsm-efr": {
	source: "iana"
},
	"audio/gsm-hr-08": {
	source: "iana"
},
	"audio/ilbc": {
	source: "iana"
},
	"audio/ip-mr_v2.5": {
	source: "iana"
},
	"audio/isac": {
	source: "apache"
},
	"audio/l16": {
	source: "iana"
},
	"audio/l20": {
	source: "iana"
},
	"audio/l24": {
	source: "iana",
	compressible: false
},
	"audio/l8": {
	source: "iana"
},
	"audio/lpc": {
	source: "iana"
},
	"audio/matroska": {
	source: "iana"
},
	"audio/melp": {
	source: "iana"
},
	"audio/melp1200": {
	source: "iana"
},
	"audio/melp2400": {
	source: "iana"
},
	"audio/melp600": {
	source: "iana"
},
	"audio/mhas": {
	source: "iana"
},
	"audio/midi": {
	source: "apache",
	extensions: [
		"mid",
		"midi",
		"kar",
		"rmi"
	]
},
	"audio/midi-clip": {
	source: "iana"
},
	"audio/mobile-xmf": {
	source: "iana",
	extensions: [
		"mxmf"
	]
},
	"audio/mp3": {
	compressible: false,
	extensions: [
		"mp3"
	]
},
	"audio/mp4": {
	source: "iana",
	compressible: false,
	extensions: [
		"m4a",
		"mp4a"
	]
},
	"audio/mp4a-latm": {
	source: "iana"
},
	"audio/mpa": {
	source: "iana"
},
	"audio/mpa-robust": {
	source: "iana"
},
	"audio/mpeg": {
	source: "iana",
	compressible: false,
	extensions: [
		"mpga",
		"mp2",
		"mp2a",
		"mp3",
		"m2a",
		"m3a"
	]
},
	"audio/mpeg4-generic": {
	source: "iana"
},
	"audio/musepack": {
	source: "apache"
},
	"audio/ogg": {
	source: "iana",
	compressible: false,
	extensions: [
		"oga",
		"ogg",
		"spx",
		"opus"
	]
},
	"audio/opus": {
	source: "iana"
},
	"audio/parityfec": {
	source: "iana"
},
	"audio/pcma": {
	source: "iana"
},
	"audio/pcma-wb": {
	source: "iana"
},
	"audio/pcmu": {
	source: "iana"
},
	"audio/pcmu-wb": {
	source: "iana"
},
	"audio/prs.sid": {
	source: "iana"
},
	"audio/qcelp": {
	source: "iana"
},
	"audio/raptorfec": {
	source: "iana"
},
	"audio/red": {
	source: "iana"
},
	"audio/rtp-enc-aescm128": {
	source: "iana"
},
	"audio/rtp-midi": {
	source: "iana"
},
	"audio/rtploopback": {
	source: "iana"
},
	"audio/rtx": {
	source: "iana"
},
	"audio/s3m": {
	source: "apache",
	extensions: [
		"s3m"
	]
},
	"audio/scip": {
	source: "iana"
},
	"audio/silk": {
	source: "apache",
	extensions: [
		"sil"
	]
},
	"audio/smv": {
	source: "iana"
},
	"audio/smv-qcp": {
	source: "iana"
},
	"audio/smv0": {
	source: "iana"
},
	"audio/sofa": {
	source: "iana"
},
	"audio/sp-midi": {
	source: "iana"
},
	"audio/speex": {
	source: "iana"
},
	"audio/t140c": {
	source: "iana"
},
	"audio/t38": {
	source: "iana"
},
	"audio/telephone-event": {
	source: "iana"
},
	"audio/tetra_acelp": {
	source: "iana"
},
	"audio/tetra_acelp_bb": {
	source: "iana"
},
	"audio/tone": {
	source: "iana"
},
	"audio/tsvcis": {
	source: "iana"
},
	"audio/uemclip": {
	source: "iana"
},
	"audio/ulpfec": {
	source: "iana"
},
	"audio/usac": {
	source: "iana"
},
	"audio/vdvi": {
	source: "iana"
},
	"audio/vmr-wb": {
	source: "iana"
},
	"audio/vnd.3gpp.iufp": {
	source: "iana"
},
	"audio/vnd.4sb": {
	source: "iana"
},
	"audio/vnd.audiokoz": {
	source: "iana"
},
	"audio/vnd.celp": {
	source: "iana"
},
	"audio/vnd.cisco.nse": {
	source: "iana"
},
	"audio/vnd.cmles.radio-events": {
	source: "iana"
},
	"audio/vnd.cns.anp1": {
	source: "iana"
},
	"audio/vnd.cns.inf1": {
	source: "iana"
},
	"audio/vnd.dece.audio": {
	source: "iana",
	extensions: [
		"uva",
		"uvva"
	]
},
	"audio/vnd.digital-winds": {
	source: "iana",
	extensions: [
		"eol"
	]
},
	"audio/vnd.dlna.adts": {
	source: "iana"
},
	"audio/vnd.dolby.heaac.1": {
	source: "iana"
},
	"audio/vnd.dolby.heaac.2": {
	source: "iana"
},
	"audio/vnd.dolby.mlp": {
	source: "iana"
},
	"audio/vnd.dolby.mps": {
	source: "iana"
},
	"audio/vnd.dolby.pl2": {
	source: "iana"
},
	"audio/vnd.dolby.pl2x": {
	source: "iana"
},
	"audio/vnd.dolby.pl2z": {
	source: "iana"
},
	"audio/vnd.dolby.pulse.1": {
	source: "iana"
},
	"audio/vnd.dra": {
	source: "iana",
	extensions: [
		"dra"
	]
},
	"audio/vnd.dts": {
	source: "iana",
	extensions: [
		"dts"
	]
},
	"audio/vnd.dts.hd": {
	source: "iana",
	extensions: [
		"dtshd"
	]
},
	"audio/vnd.dts.uhd": {
	source: "iana"
},
	"audio/vnd.dvb.file": {
	source: "iana"
},
	"audio/vnd.everad.plj": {
	source: "iana"
},
	"audio/vnd.hns.audio": {
	source: "iana"
},
	"audio/vnd.lucent.voice": {
	source: "iana",
	extensions: [
		"lvp"
	]
},
	"audio/vnd.ms-playready.media.pya": {
	source: "iana",
	extensions: [
		"pya"
	]
},
	"audio/vnd.nokia.mobile-xmf": {
	source: "iana"
},
	"audio/vnd.nortel.vbk": {
	source: "iana"
},
	"audio/vnd.nuera.ecelp4800": {
	source: "iana",
	extensions: [
		"ecelp4800"
	]
},
	"audio/vnd.nuera.ecelp7470": {
	source: "iana",
	extensions: [
		"ecelp7470"
	]
},
	"audio/vnd.nuera.ecelp9600": {
	source: "iana",
	extensions: [
		"ecelp9600"
	]
},
	"audio/vnd.octel.sbc": {
	source: "iana"
},
	"audio/vnd.presonus.multitrack": {
	source: "iana"
},
	"audio/vnd.qcelp": {
	source: "apache"
},
	"audio/vnd.rhetorex.32kadpcm": {
	source: "iana"
},
	"audio/vnd.rip": {
	source: "iana",
	extensions: [
		"rip"
	]
},
	"audio/vnd.rn-realaudio": {
	compressible: false
},
	"audio/vnd.sealedmedia.softseal.mpeg": {
	source: "iana"
},
	"audio/vnd.vmx.cvsd": {
	source: "iana"
},
	"audio/vnd.wave": {
	compressible: false
},
	"audio/vorbis": {
	source: "iana",
	compressible: false
},
	"audio/vorbis-config": {
	source: "iana"
},
	"audio/wav": {
	compressible: false,
	extensions: [
		"wav"
	]
},
	"audio/wave": {
	compressible: false,
	extensions: [
		"wav"
	]
},
	"audio/webm": {
	source: "apache",
	compressible: false,
	extensions: [
		"weba"
	]
},
	"audio/x-aac": {
	source: "apache",
	compressible: false,
	extensions: [
		"aac"
	]
},
	"audio/x-aiff": {
	source: "apache",
	extensions: [
		"aif",
		"aiff",
		"aifc"
	]
},
	"audio/x-caf": {
	source: "apache",
	compressible: false,
	extensions: [
		"caf"
	]
},
	"audio/x-flac": {
	source: "apache",
	extensions: [
		"flac"
	]
},
	"audio/x-m4a": {
	source: "nginx",
	extensions: [
		"m4a"
	]
},
	"audio/x-matroska": {
	source: "apache",
	extensions: [
		"mka"
	]
},
	"audio/x-mpegurl": {
	source: "apache",
	extensions: [
		"m3u"
	]
},
	"audio/x-ms-wax": {
	source: "apache",
	extensions: [
		"wax"
	]
},
	"audio/x-ms-wma": {
	source: "apache",
	extensions: [
		"wma"
	]
},
	"audio/x-pn-realaudio": {
	source: "apache",
	extensions: [
		"ram",
		"ra"
	]
},
	"audio/x-pn-realaudio-plugin": {
	source: "apache",
	extensions: [
		"rmp"
	]
},
	"audio/x-realaudio": {
	source: "nginx",
	extensions: [
		"ra"
	]
},
	"audio/x-tta": {
	source: "apache"
},
	"audio/x-wav": {
	source: "apache",
	extensions: [
		"wav"
	]
},
	"audio/xm": {
	source: "apache",
	extensions: [
		"xm"
	]
},
	"chemical/x-cdx": {
	source: "apache",
	extensions: [
		"cdx"
	]
},
	"chemical/x-cif": {
	source: "apache",
	extensions: [
		"cif"
	]
},
	"chemical/x-cmdf": {
	source: "apache",
	extensions: [
		"cmdf"
	]
},
	"chemical/x-cml": {
	source: "apache",
	extensions: [
		"cml"
	]
},
	"chemical/x-csml": {
	source: "apache",
	extensions: [
		"csml"
	]
},
	"chemical/x-pdb": {
	source: "apache"
},
	"chemical/x-xyz": {
	source: "apache",
	extensions: [
		"xyz"
	]
},
	"font/collection": {
	source: "iana",
	extensions: [
		"ttc"
	]
},
	"font/otf": {
	source: "iana",
	compressible: true,
	extensions: [
		"otf"
	]
},
	"font/sfnt": {
	source: "iana"
},
	"font/ttf": {
	source: "iana",
	compressible: true,
	extensions: [
		"ttf"
	]
},
	"font/woff": {
	source: "iana",
	extensions: [
		"woff"
	]
},
	"font/woff2": {
	source: "iana",
	extensions: [
		"woff2"
	]
},
	"image/aces": {
	source: "iana",
	extensions: [
		"exr"
	]
},
	"image/apng": {
	source: "iana",
	compressible: false,
	extensions: [
		"apng"
	]
},
	"image/avci": {
	source: "iana",
	extensions: [
		"avci"
	]
},
	"image/avcs": {
	source: "iana",
	extensions: [
		"avcs"
	]
},
	"image/avif": {
	source: "iana",
	compressible: false,
	extensions: [
		"avif"
	]
},
	"image/bmp": {
	source: "iana",
	compressible: true,
	extensions: [
		"bmp",
		"dib"
	]
},
	"image/cgm": {
	source: "iana",
	extensions: [
		"cgm"
	]
},
	"image/dicom-rle": {
	source: "iana",
	extensions: [
		"drle"
	]
},
	"image/dpx": {
	source: "iana",
	extensions: [
		"dpx"
	]
},
	"image/emf": {
	source: "iana",
	extensions: [
		"emf"
	]
},
	"image/fits": {
	source: "iana",
	extensions: [
		"fits"
	]
},
	"image/g3fax": {
	source: "iana",
	extensions: [
		"g3"
	]
},
	"image/gif": {
	source: "iana",
	compressible: false,
	extensions: [
		"gif"
	]
},
	"image/heic": {
	source: "iana",
	extensions: [
		"heic"
	]
},
	"image/heic-sequence": {
	source: "iana",
	extensions: [
		"heics"
	]
},
	"image/heif": {
	source: "iana",
	extensions: [
		"heif"
	]
},
	"image/heif-sequence": {
	source: "iana",
	extensions: [
		"heifs"
	]
},
	"image/hej2k": {
	source: "iana",
	extensions: [
		"hej2"
	]
},
	"image/hsj2": {
	source: "iana",
	extensions: [
		"hsj2"
	]
},
	"image/ief": {
	source: "iana",
	extensions: [
		"ief"
	]
},
	"image/j2c": {
	source: "iana"
},
	"image/jls": {
	source: "iana",
	extensions: [
		"jls"
	]
},
	"image/jp2": {
	source: "iana",
	compressible: false,
	extensions: [
		"jp2",
		"jpg2"
	]
},
	"image/jpeg": {
	source: "iana",
	compressible: false,
	extensions: [
		"jpeg",
		"jpg",
		"jpe"
	]
},
	"image/jph": {
	source: "iana",
	extensions: [
		"jph"
	]
},
	"image/jphc": {
	source: "iana",
	extensions: [
		"jhc"
	]
},
	"image/jpm": {
	source: "iana",
	compressible: false,
	extensions: [
		"jpm",
		"jpgm"
	]
},
	"image/jpx": {
	source: "iana",
	compressible: false,
	extensions: [
		"jpx",
		"jpf"
	]
},
	"image/jxl": {
	source: "iana",
	extensions: [
		"jxl"
	]
},
	"image/jxr": {
	source: "iana",
	extensions: [
		"jxr"
	]
},
	"image/jxra": {
	source: "iana",
	extensions: [
		"jxra"
	]
},
	"image/jxrs": {
	source: "iana",
	extensions: [
		"jxrs"
	]
},
	"image/jxs": {
	source: "iana",
	extensions: [
		"jxs"
	]
},
	"image/jxsc": {
	source: "iana",
	extensions: [
		"jxsc"
	]
},
	"image/jxsi": {
	source: "iana",
	extensions: [
		"jxsi"
	]
},
	"image/jxss": {
	source: "iana",
	extensions: [
		"jxss"
	]
},
	"image/ktx": {
	source: "iana",
	extensions: [
		"ktx"
	]
},
	"image/ktx2": {
	source: "iana",
	extensions: [
		"ktx2"
	]
},
	"image/naplps": {
	source: "iana"
},
	"image/pjpeg": {
	compressible: false
},
	"image/png": {
	source: "iana",
	compressible: false,
	extensions: [
		"png"
	]
},
	"image/prs.btif": {
	source: "iana",
	extensions: [
		"btif",
		"btf"
	]
},
	"image/prs.pti": {
	source: "iana",
	extensions: [
		"pti"
	]
},
	"image/pwg-raster": {
	source: "iana"
},
	"image/sgi": {
	source: "apache",
	extensions: [
		"sgi"
	]
},
	"image/svg+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"svg",
		"svgz"
	]
},
	"image/t38": {
	source: "iana",
	extensions: [
		"t38"
	]
},
	"image/tiff": {
	source: "iana",
	compressible: false,
	extensions: [
		"tif",
		"tiff"
	]
},
	"image/tiff-fx": {
	source: "iana",
	extensions: [
		"tfx"
	]
},
	"image/vnd.adobe.photoshop": {
	source: "iana",
	compressible: true,
	extensions: [
		"psd"
	]
},
	"image/vnd.airzip.accelerator.azv": {
	source: "iana",
	extensions: [
		"azv"
	]
},
	"image/vnd.cns.inf2": {
	source: "iana"
},
	"image/vnd.dece.graphic": {
	source: "iana",
	extensions: [
		"uvi",
		"uvvi",
		"uvg",
		"uvvg"
	]
},
	"image/vnd.djvu": {
	source: "iana",
	extensions: [
		"djvu",
		"djv"
	]
},
	"image/vnd.dvb.subtitle": {
	source: "iana",
	extensions: [
		"sub"
	]
},
	"image/vnd.dwg": {
	source: "iana",
	extensions: [
		"dwg"
	]
},
	"image/vnd.dxf": {
	source: "iana",
	extensions: [
		"dxf"
	]
},
	"image/vnd.fastbidsheet": {
	source: "iana",
	extensions: [
		"fbs"
	]
},
	"image/vnd.fpx": {
	source: "iana",
	extensions: [
		"fpx"
	]
},
	"image/vnd.fst": {
	source: "iana",
	extensions: [
		"fst"
	]
},
	"image/vnd.fujixerox.edmics-mmr": {
	source: "iana",
	extensions: [
		"mmr"
	]
},
	"image/vnd.fujixerox.edmics-rlc": {
	source: "iana",
	extensions: [
		"rlc"
	]
},
	"image/vnd.globalgraphics.pgb": {
	source: "iana"
},
	"image/vnd.microsoft.icon": {
	source: "iana",
	compressible: true,
	extensions: [
		"ico"
	]
},
	"image/vnd.mix": {
	source: "iana"
},
	"image/vnd.mozilla.apng": {
	source: "iana"
},
	"image/vnd.ms-dds": {
	compressible: true,
	extensions: [
		"dds"
	]
},
	"image/vnd.ms-modi": {
	source: "iana",
	extensions: [
		"mdi"
	]
},
	"image/vnd.ms-photo": {
	source: "apache",
	extensions: [
		"wdp"
	]
},
	"image/vnd.net-fpx": {
	source: "iana",
	extensions: [
		"npx"
	]
},
	"image/vnd.pco.b16": {
	source: "iana",
	extensions: [
		"b16"
	]
},
	"image/vnd.radiance": {
	source: "iana"
},
	"image/vnd.sealed.png": {
	source: "iana"
},
	"image/vnd.sealedmedia.softseal.gif": {
	source: "iana"
},
	"image/vnd.sealedmedia.softseal.jpg": {
	source: "iana"
},
	"image/vnd.svf": {
	source: "iana"
},
	"image/vnd.tencent.tap": {
	source: "iana",
	extensions: [
		"tap"
	]
},
	"image/vnd.valve.source.texture": {
	source: "iana",
	extensions: [
		"vtf"
	]
},
	"image/vnd.wap.wbmp": {
	source: "iana",
	extensions: [
		"wbmp"
	]
},
	"image/vnd.xiff": {
	source: "iana",
	extensions: [
		"xif"
	]
},
	"image/vnd.zbrush.pcx": {
	source: "iana",
	extensions: [
		"pcx"
	]
},
	"image/webp": {
	source: "iana",
	extensions: [
		"webp"
	]
},
	"image/wmf": {
	source: "iana",
	extensions: [
		"wmf"
	]
},
	"image/x-3ds": {
	source: "apache",
	extensions: [
		"3ds"
	]
},
	"image/x-cmu-raster": {
	source: "apache",
	extensions: [
		"ras"
	]
},
	"image/x-cmx": {
	source: "apache",
	extensions: [
		"cmx"
	]
},
	"image/x-freehand": {
	source: "apache",
	extensions: [
		"fh",
		"fhc",
		"fh4",
		"fh5",
		"fh7"
	]
},
	"image/x-icon": {
	source: "apache",
	compressible: true,
	extensions: [
		"ico"
	]
},
	"image/x-jng": {
	source: "nginx",
	extensions: [
		"jng"
	]
},
	"image/x-mrsid-image": {
	source: "apache",
	extensions: [
		"sid"
	]
},
	"image/x-ms-bmp": {
	source: "nginx",
	compressible: true,
	extensions: [
		"bmp"
	]
},
	"image/x-pcx": {
	source: "apache",
	extensions: [
		"pcx"
	]
},
	"image/x-pict": {
	source: "apache",
	extensions: [
		"pic",
		"pct"
	]
},
	"image/x-portable-anymap": {
	source: "apache",
	extensions: [
		"pnm"
	]
},
	"image/x-portable-bitmap": {
	source: "apache",
	extensions: [
		"pbm"
	]
},
	"image/x-portable-graymap": {
	source: "apache",
	extensions: [
		"pgm"
	]
},
	"image/x-portable-pixmap": {
	source: "apache",
	extensions: [
		"ppm"
	]
},
	"image/x-rgb": {
	source: "apache",
	extensions: [
		"rgb"
	]
},
	"image/x-tga": {
	source: "apache",
	extensions: [
		"tga"
	]
},
	"image/x-xbitmap": {
	source: "apache",
	extensions: [
		"xbm"
	]
},
	"image/x-xcf": {
	compressible: false
},
	"image/x-xpixmap": {
	source: "apache",
	extensions: [
		"xpm"
	]
},
	"image/x-xwindowdump": {
	source: "apache",
	extensions: [
		"xwd"
	]
},
	"message/bhttp": {
	source: "iana"
},
	"message/cpim": {
	source: "iana"
},
	"message/delivery-status": {
	source: "iana"
},
	"message/disposition-notification": {
	source: "iana",
	extensions: [
		"disposition-notification"
	]
},
	"message/external-body": {
	source: "iana"
},
	"message/feedback-report": {
	source: "iana"
},
	"message/global": {
	source: "iana",
	extensions: [
		"u8msg"
	]
},
	"message/global-delivery-status": {
	source: "iana",
	extensions: [
		"u8dsn"
	]
},
	"message/global-disposition-notification": {
	source: "iana",
	extensions: [
		"u8mdn"
	]
},
	"message/global-headers": {
	source: "iana",
	extensions: [
		"u8hdr"
	]
},
	"message/http": {
	source: "iana",
	compressible: false
},
	"message/imdn+xml": {
	source: "iana",
	compressible: true
},
	"message/mls": {
	source: "iana"
},
	"message/news": {
	source: "apache"
},
	"message/ohttp-req": {
	source: "iana"
},
	"message/ohttp-res": {
	source: "iana"
},
	"message/partial": {
	source: "iana",
	compressible: false
},
	"message/rfc822": {
	source: "iana",
	compressible: true,
	extensions: [
		"eml",
		"mime"
	]
},
	"message/s-http": {
	source: "apache"
},
	"message/sip": {
	source: "iana"
},
	"message/sipfrag": {
	source: "iana"
},
	"message/tracking-status": {
	source: "iana"
},
	"message/vnd.si.simp": {
	source: "apache"
},
	"message/vnd.wfa.wsc": {
	source: "iana",
	extensions: [
		"wsc"
	]
},
	"model/3mf": {
	source: "iana",
	extensions: [
		"3mf"
	]
},
	"model/e57": {
	source: "iana"
},
	"model/gltf+json": {
	source: "iana",
	compressible: true,
	extensions: [
		"gltf"
	]
},
	"model/gltf-binary": {
	source: "iana",
	compressible: true,
	extensions: [
		"glb"
	]
},
	"model/iges": {
	source: "iana",
	compressible: false,
	extensions: [
		"igs",
		"iges"
	]
},
	"model/jt": {
	source: "iana",
	extensions: [
		"jt"
	]
},
	"model/mesh": {
	source: "iana",
	compressible: false,
	extensions: [
		"msh",
		"mesh",
		"silo"
	]
},
	"model/mtl": {
	source: "iana",
	extensions: [
		"mtl"
	]
},
	"model/obj": {
	source: "iana",
	extensions: [
		"obj"
	]
},
	"model/prc": {
	source: "iana",
	extensions: [
		"prc"
	]
},
	"model/step": {
	source: "iana"
},
	"model/step+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"stpx"
	]
},
	"model/step+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"stpz"
	]
},
	"model/step-xml+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"stpxz"
	]
},
	"model/stl": {
	source: "iana",
	extensions: [
		"stl"
	]
},
	"model/u3d": {
	source: "iana",
	extensions: [
		"u3d"
	]
},
	"model/vnd.bary": {
	source: "iana",
	extensions: [
		"bary"
	]
},
	"model/vnd.cld": {
	source: "iana",
	extensions: [
		"cld"
	]
},
	"model/vnd.collada+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"dae"
	]
},
	"model/vnd.dwf": {
	source: "iana",
	extensions: [
		"dwf"
	]
},
	"model/vnd.flatland.3dml": {
	source: "iana"
},
	"model/vnd.gdl": {
	source: "iana",
	extensions: [
		"gdl"
	]
},
	"model/vnd.gs-gdl": {
	source: "apache"
},
	"model/vnd.gs.gdl": {
	source: "iana"
},
	"model/vnd.gtw": {
	source: "iana",
	extensions: [
		"gtw"
	]
},
	"model/vnd.moml+xml": {
	source: "iana",
	compressible: true
},
	"model/vnd.mts": {
	source: "iana",
	extensions: [
		"mts"
	]
},
	"model/vnd.opengex": {
	source: "iana",
	extensions: [
		"ogex"
	]
},
	"model/vnd.parasolid.transmit.binary": {
	source: "iana",
	extensions: [
		"x_b"
	]
},
	"model/vnd.parasolid.transmit.text": {
	source: "iana",
	extensions: [
		"x_t"
	]
},
	"model/vnd.pytha.pyox": {
	source: "iana",
	extensions: [
		"pyo",
		"pyox"
	]
},
	"model/vnd.rosette.annotated-data-model": {
	source: "iana"
},
	"model/vnd.sap.vds": {
	source: "iana",
	extensions: [
		"vds"
	]
},
	"model/vnd.usda": {
	source: "iana",
	extensions: [
		"usda"
	]
},
	"model/vnd.usdz+zip": {
	source: "iana",
	compressible: false,
	extensions: [
		"usdz"
	]
},
	"model/vnd.valve.source.compiled-map": {
	source: "iana",
	extensions: [
		"bsp"
	]
},
	"model/vnd.vtu": {
	source: "iana",
	extensions: [
		"vtu"
	]
},
	"model/vrml": {
	source: "iana",
	compressible: false,
	extensions: [
		"wrl",
		"vrml"
	]
},
	"model/x3d+binary": {
	source: "apache",
	compressible: false,
	extensions: [
		"x3db",
		"x3dbz"
	]
},
	"model/x3d+fastinfoset": {
	source: "iana",
	extensions: [
		"x3db"
	]
},
	"model/x3d+vrml": {
	source: "apache",
	compressible: false,
	extensions: [
		"x3dv",
		"x3dvz"
	]
},
	"model/x3d+xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"x3d",
		"x3dz"
	]
},
	"model/x3d-vrml": {
	source: "iana",
	extensions: [
		"x3dv"
	]
},
	"multipart/alternative": {
	source: "iana",
	compressible: false
},
	"multipart/appledouble": {
	source: "iana"
},
	"multipart/byteranges": {
	source: "iana"
},
	"multipart/digest": {
	source: "iana"
},
	"multipart/encrypted": {
	source: "iana",
	compressible: false
},
	"multipart/form-data": {
	source: "iana",
	compressible: false
},
	"multipart/header-set": {
	source: "iana"
},
	"multipart/mixed": {
	source: "iana"
},
	"multipart/multilingual": {
	source: "iana"
},
	"multipart/parallel": {
	source: "iana"
},
	"multipart/related": {
	source: "iana",
	compressible: false
},
	"multipart/report": {
	source: "iana"
},
	"multipart/signed": {
	source: "iana",
	compressible: false
},
	"multipart/vnd.bint.med-plus": {
	source: "iana"
},
	"multipart/voice-message": {
	source: "iana"
},
	"multipart/x-mixed-replace": {
	source: "iana"
},
	"text/1d-interleaved-parityfec": {
	source: "iana"
},
	"text/cache-manifest": {
	source: "iana",
	compressible: true,
	extensions: [
		"appcache",
		"manifest"
	]
},
	"text/calendar": {
	source: "iana",
	extensions: [
		"ics",
		"ifb"
	]
},
	"text/calender": {
	compressible: true
},
	"text/cmd": {
	compressible: true
},
	"text/coffeescript": {
	extensions: [
		"coffee",
		"litcoffee"
	]
},
	"text/cql": {
	source: "iana"
},
	"text/cql-expression": {
	source: "iana"
},
	"text/cql-identifier": {
	source: "iana"
},
	"text/css": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"css"
	]
},
	"text/csv": {
	source: "iana",
	compressible: true,
	extensions: [
		"csv"
	]
},
	"text/csv-schema": {
	source: "iana"
},
	"text/directory": {
	source: "iana"
},
	"text/dns": {
	source: "iana"
},
	"text/ecmascript": {
	source: "apache"
},
	"text/encaprtp": {
	source: "iana"
},
	"text/enriched": {
	source: "iana"
},
	"text/fhirpath": {
	source: "iana"
},
	"text/flexfec": {
	source: "iana"
},
	"text/fwdred": {
	source: "iana"
},
	"text/gff3": {
	source: "iana"
},
	"text/grammar-ref-list": {
	source: "iana"
},
	"text/hl7v2": {
	source: "iana"
},
	"text/html": {
	source: "iana",
	compressible: true,
	extensions: [
		"html",
		"htm",
		"shtml"
	]
},
	"text/jade": {
	extensions: [
		"jade"
	]
},
	"text/javascript": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"js",
		"mjs"
	]
},
	"text/jcr-cnd": {
	source: "iana"
},
	"text/jsx": {
	compressible: true,
	extensions: [
		"jsx"
	]
},
	"text/less": {
	compressible: true,
	extensions: [
		"less"
	]
},
	"text/markdown": {
	source: "iana",
	compressible: true,
	extensions: [
		"md",
		"markdown"
	]
},
	"text/mathml": {
	source: "nginx",
	extensions: [
		"mml"
	]
},
	"text/mdx": {
	compressible: true,
	extensions: [
		"mdx"
	]
},
	"text/mizar": {
	source: "iana"
},
	"text/n3": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"n3"
	]
},
	"text/parameters": {
	source: "iana",
	charset: "UTF-8"
},
	"text/parityfec": {
	source: "iana"
},
	"text/plain": {
	source: "iana",
	compressible: true,
	extensions: [
		"txt",
		"text",
		"conf",
		"def",
		"list",
		"log",
		"in",
		"ini"
	]
},
	"text/provenance-notation": {
	source: "iana",
	charset: "UTF-8"
},
	"text/prs.fallenstein.rst": {
	source: "iana"
},
	"text/prs.lines.tag": {
	source: "iana",
	extensions: [
		"dsc"
	]
},
	"text/prs.prop.logic": {
	source: "iana"
},
	"text/prs.texi": {
	source: "iana"
},
	"text/raptorfec": {
	source: "iana"
},
	"text/red": {
	source: "iana"
},
	"text/rfc822-headers": {
	source: "iana"
},
	"text/richtext": {
	source: "iana",
	compressible: true,
	extensions: [
		"rtx"
	]
},
	"text/rtf": {
	source: "iana",
	compressible: true,
	extensions: [
		"rtf"
	]
},
	"text/rtp-enc-aescm128": {
	source: "iana"
},
	"text/rtploopback": {
	source: "iana"
},
	"text/rtx": {
	source: "iana"
},
	"text/sgml": {
	source: "iana",
	extensions: [
		"sgml",
		"sgm"
	]
},
	"text/shaclc": {
	source: "iana"
},
	"text/shex": {
	source: "iana",
	extensions: [
		"shex"
	]
},
	"text/slim": {
	extensions: [
		"slim",
		"slm"
	]
},
	"text/spdx": {
	source: "iana",
	extensions: [
		"spdx"
	]
},
	"text/strings": {
	source: "iana"
},
	"text/stylus": {
	extensions: [
		"stylus",
		"styl"
	]
},
	"text/t140": {
	source: "iana"
},
	"text/tab-separated-values": {
	source: "iana",
	compressible: true,
	extensions: [
		"tsv"
	]
},
	"text/troff": {
	source: "iana",
	extensions: [
		"t",
		"tr",
		"roff",
		"man",
		"me",
		"ms"
	]
},
	"text/turtle": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"ttl"
	]
},
	"text/ulpfec": {
	source: "iana"
},
	"text/uri-list": {
	source: "iana",
	compressible: true,
	extensions: [
		"uri",
		"uris",
		"urls"
	]
},
	"text/vcard": {
	source: "iana",
	compressible: true,
	extensions: [
		"vcard"
	]
},
	"text/vnd.a": {
	source: "iana"
},
	"text/vnd.abc": {
	source: "iana"
},
	"text/vnd.ascii-art": {
	source: "iana"
},
	"text/vnd.curl": {
	source: "iana",
	extensions: [
		"curl"
	]
},
	"text/vnd.curl.dcurl": {
	source: "apache",
	extensions: [
		"dcurl"
	]
},
	"text/vnd.curl.mcurl": {
	source: "apache",
	extensions: [
		"mcurl"
	]
},
	"text/vnd.curl.scurl": {
	source: "apache",
	extensions: [
		"scurl"
	]
},
	"text/vnd.debian.copyright": {
	source: "iana",
	charset: "UTF-8"
},
	"text/vnd.dmclientscript": {
	source: "iana"
},
	"text/vnd.dvb.subtitle": {
	source: "iana",
	extensions: [
		"sub"
	]
},
	"text/vnd.esmertec.theme-descriptor": {
	source: "iana",
	charset: "UTF-8"
},
	"text/vnd.exchangeable": {
	source: "iana"
},
	"text/vnd.familysearch.gedcom": {
	source: "iana",
	extensions: [
		"ged"
	]
},
	"text/vnd.ficlab.flt": {
	source: "iana"
},
	"text/vnd.fly": {
	source: "iana",
	extensions: [
		"fly"
	]
},
	"text/vnd.fmi.flexstor": {
	source: "iana",
	extensions: [
		"flx"
	]
},
	"text/vnd.gml": {
	source: "iana"
},
	"text/vnd.graphviz": {
	source: "iana",
	extensions: [
		"gv"
	]
},
	"text/vnd.hans": {
	source: "iana"
},
	"text/vnd.hgl": {
	source: "iana"
},
	"text/vnd.in3d.3dml": {
	source: "iana",
	extensions: [
		"3dml"
	]
},
	"text/vnd.in3d.spot": {
	source: "iana",
	extensions: [
		"spot"
	]
},
	"text/vnd.iptc.newsml": {
	source: "iana"
},
	"text/vnd.iptc.nitf": {
	source: "iana"
},
	"text/vnd.latex-z": {
	source: "iana"
},
	"text/vnd.motorola.reflex": {
	source: "iana"
},
	"text/vnd.ms-mediapackage": {
	source: "iana"
},
	"text/vnd.net2phone.commcenter.command": {
	source: "iana"
},
	"text/vnd.radisys.msml-basic-layout": {
	source: "iana"
},
	"text/vnd.senx.warpscript": {
	source: "iana"
},
	"text/vnd.si.uricatalogue": {
	source: "apache"
},
	"text/vnd.sosi": {
	source: "iana"
},
	"text/vnd.sun.j2me.app-descriptor": {
	source: "iana",
	charset: "UTF-8",
	extensions: [
		"jad"
	]
},
	"text/vnd.trolltech.linguist": {
	source: "iana",
	charset: "UTF-8"
},
	"text/vnd.vcf": {
	source: "iana"
},
	"text/vnd.wap.si": {
	source: "iana"
},
	"text/vnd.wap.sl": {
	source: "iana"
},
	"text/vnd.wap.wml": {
	source: "iana",
	extensions: [
		"wml"
	]
},
	"text/vnd.wap.wmlscript": {
	source: "iana",
	extensions: [
		"wmls"
	]
},
	"text/vnd.zoo.kcl": {
	source: "iana"
},
	"text/vtt": {
	source: "iana",
	charset: "UTF-8",
	compressible: true,
	extensions: [
		"vtt"
	]
},
	"text/wgsl": {
	source: "iana",
	extensions: [
		"wgsl"
	]
},
	"text/x-asm": {
	source: "apache",
	extensions: [
		"s",
		"asm"
	]
},
	"text/x-c": {
	source: "apache",
	extensions: [
		"c",
		"cc",
		"cxx",
		"cpp",
		"h",
		"hh",
		"dic"
	]
},
	"text/x-component": {
	source: "nginx",
	extensions: [
		"htc"
	]
},
	"text/x-fortran": {
	source: "apache",
	extensions: [
		"f",
		"for",
		"f77",
		"f90"
	]
},
	"text/x-gwt-rpc": {
	compressible: true
},
	"text/x-handlebars-template": {
	extensions: [
		"hbs"
	]
},
	"text/x-java-source": {
	source: "apache",
	extensions: [
		"java"
	]
},
	"text/x-jquery-tmpl": {
	compressible: true
},
	"text/x-lua": {
	extensions: [
		"lua"
	]
},
	"text/x-markdown": {
	compressible: true,
	extensions: [
		"mkd"
	]
},
	"text/x-nfo": {
	source: "apache",
	extensions: [
		"nfo"
	]
},
	"text/x-opml": {
	source: "apache",
	extensions: [
		"opml"
	]
},
	"text/x-org": {
	compressible: true,
	extensions: [
		"org"
	]
},
	"text/x-pascal": {
	source: "apache",
	extensions: [
		"p",
		"pas"
	]
},
	"text/x-processing": {
	compressible: true,
	extensions: [
		"pde"
	]
},
	"text/x-sass": {
	extensions: [
		"sass"
	]
},
	"text/x-scss": {
	extensions: [
		"scss"
	]
},
	"text/x-setext": {
	source: "apache",
	extensions: [
		"etx"
	]
},
	"text/x-sfv": {
	source: "apache",
	extensions: [
		"sfv"
	]
},
	"text/x-suse-ymp": {
	compressible: true,
	extensions: [
		"ymp"
	]
},
	"text/x-uuencode": {
	source: "apache",
	extensions: [
		"uu"
	]
},
	"text/x-vcalendar": {
	source: "apache",
	extensions: [
		"vcs"
	]
},
	"text/x-vcard": {
	source: "apache",
	extensions: [
		"vcf"
	]
},
	"text/xml": {
	source: "iana",
	compressible: true,
	extensions: [
		"xml"
	]
},
	"text/xml-external-parsed-entity": {
	source: "iana"
},
	"text/yaml": {
	compressible: true,
	extensions: [
		"yaml",
		"yml"
	]
},
	"video/1d-interleaved-parityfec": {
	source: "iana"
},
	"video/3gpp": {
	source: "iana",
	extensions: [
		"3gp",
		"3gpp"
	]
},
	"video/3gpp-tt": {
	source: "iana"
},
	"video/3gpp2": {
	source: "iana",
	extensions: [
		"3g2"
	]
},
	"video/av1": {
	source: "iana"
},
	"video/bmpeg": {
	source: "iana"
},
	"video/bt656": {
	source: "iana"
},
	"video/celb": {
	source: "iana"
},
	"video/dv": {
	source: "iana"
},
	"video/encaprtp": {
	source: "iana"
},
	"video/evc": {
	source: "iana"
},
	"video/ffv1": {
	source: "iana"
},
	"video/flexfec": {
	source: "iana"
},
	"video/h261": {
	source: "iana",
	extensions: [
		"h261"
	]
},
	"video/h263": {
	source: "iana",
	extensions: [
		"h263"
	]
},
	"video/h263-1998": {
	source: "iana"
},
	"video/h263-2000": {
	source: "iana"
},
	"video/h264": {
	source: "iana",
	extensions: [
		"h264"
	]
},
	"video/h264-rcdo": {
	source: "iana"
},
	"video/h264-svc": {
	source: "iana"
},
	"video/h265": {
	source: "iana"
},
	"video/h266": {
	source: "iana"
},
	"video/iso.segment": {
	source: "iana",
	extensions: [
		"m4s"
	]
},
	"video/jpeg": {
	source: "iana",
	extensions: [
		"jpgv"
	]
},
	"video/jpeg2000": {
	source: "iana"
},
	"video/jpm": {
	source: "apache",
	extensions: [
		"jpm",
		"jpgm"
	]
},
	"video/jxsv": {
	source: "iana"
},
	"video/matroska": {
	source: "iana"
},
	"video/matroska-3d": {
	source: "iana"
},
	"video/mj2": {
	source: "iana",
	extensions: [
		"mj2",
		"mjp2"
	]
},
	"video/mp1s": {
	source: "iana"
},
	"video/mp2p": {
	source: "iana"
},
	"video/mp2t": {
	source: "iana",
	extensions: [
		"ts",
		"m2t",
		"m2ts",
		"mts"
	]
},
	"video/mp4": {
	source: "iana",
	compressible: false,
	extensions: [
		"mp4",
		"mp4v",
		"mpg4"
	]
},
	"video/mp4v-es": {
	source: "iana"
},
	"video/mpeg": {
	source: "iana",
	compressible: false,
	extensions: [
		"mpeg",
		"mpg",
		"mpe",
		"m1v",
		"m2v"
	]
},
	"video/mpeg4-generic": {
	source: "iana"
},
	"video/mpv": {
	source: "iana"
},
	"video/nv": {
	source: "iana"
},
	"video/ogg": {
	source: "iana",
	compressible: false,
	extensions: [
		"ogv"
	]
},
	"video/parityfec": {
	source: "iana"
},
	"video/pointer": {
	source: "iana"
},
	"video/quicktime": {
	source: "iana",
	compressible: false,
	extensions: [
		"qt",
		"mov"
	]
},
	"video/raptorfec": {
	source: "iana"
},
	"video/raw": {
	source: "iana"
},
	"video/rtp-enc-aescm128": {
	source: "iana"
},
	"video/rtploopback": {
	source: "iana"
},
	"video/rtx": {
	source: "iana"
},
	"video/scip": {
	source: "iana"
},
	"video/smpte291": {
	source: "iana"
},
	"video/smpte292m": {
	source: "iana"
},
	"video/ulpfec": {
	source: "iana"
},
	"video/vc1": {
	source: "iana"
},
	"video/vc2": {
	source: "iana"
},
	"video/vnd.cctv": {
	source: "iana"
},
	"video/vnd.dece.hd": {
	source: "iana",
	extensions: [
		"uvh",
		"uvvh"
	]
},
	"video/vnd.dece.mobile": {
	source: "iana",
	extensions: [
		"uvm",
		"uvvm"
	]
},
	"video/vnd.dece.mp4": {
	source: "iana"
},
	"video/vnd.dece.pd": {
	source: "iana",
	extensions: [
		"uvp",
		"uvvp"
	]
},
	"video/vnd.dece.sd": {
	source: "iana",
	extensions: [
		"uvs",
		"uvvs"
	]
},
	"video/vnd.dece.video": {
	source: "iana",
	extensions: [
		"uvv",
		"uvvv"
	]
},
	"video/vnd.directv.mpeg": {
	source: "iana"
},
	"video/vnd.directv.mpeg-tts": {
	source: "iana"
},
	"video/vnd.dlna.mpeg-tts": {
	source: "iana"
},
	"video/vnd.dvb.file": {
	source: "iana",
	extensions: [
		"dvb"
	]
},
	"video/vnd.fvt": {
	source: "iana",
	extensions: [
		"fvt"
	]
},
	"video/vnd.hns.video": {
	source: "iana"
},
	"video/vnd.iptvforum.1dparityfec-1010": {
	source: "iana"
},
	"video/vnd.iptvforum.1dparityfec-2005": {
	source: "iana"
},
	"video/vnd.iptvforum.2dparityfec-1010": {
	source: "iana"
},
	"video/vnd.iptvforum.2dparityfec-2005": {
	source: "iana"
},
	"video/vnd.iptvforum.ttsavc": {
	source: "iana"
},
	"video/vnd.iptvforum.ttsmpeg2": {
	source: "iana"
},
	"video/vnd.motorola.video": {
	source: "iana"
},
	"video/vnd.motorola.videop": {
	source: "iana"
},
	"video/vnd.mpegurl": {
	source: "iana",
	extensions: [
		"mxu",
		"m4u"
	]
},
	"video/vnd.ms-playready.media.pyv": {
	source: "iana",
	extensions: [
		"pyv"
	]
},
	"video/vnd.nokia.interleaved-multimedia": {
	source: "iana"
},
	"video/vnd.nokia.mp4vr": {
	source: "iana"
},
	"video/vnd.nokia.videovoip": {
	source: "iana"
},
	"video/vnd.objectvideo": {
	source: "iana"
},
	"video/vnd.radgamettools.bink": {
	source: "iana"
},
	"video/vnd.radgamettools.smacker": {
	source: "apache"
},
	"video/vnd.sealed.mpeg1": {
	source: "iana"
},
	"video/vnd.sealed.mpeg4": {
	source: "iana"
},
	"video/vnd.sealed.swf": {
	source: "iana"
},
	"video/vnd.sealedmedia.softseal.mov": {
	source: "iana"
},
	"video/vnd.uvvu.mp4": {
	source: "iana",
	extensions: [
		"uvu",
		"uvvu"
	]
},
	"video/vnd.vivo": {
	source: "iana",
	extensions: [
		"viv"
	]
},
	"video/vnd.youtube.yt": {
	source: "iana"
},
	"video/vp8": {
	source: "iana"
},
	"video/vp9": {
	source: "iana"
},
	"video/webm": {
	source: "apache",
	compressible: false,
	extensions: [
		"webm"
	]
},
	"video/x-f4v": {
	source: "apache",
	extensions: [
		"f4v"
	]
},
	"video/x-fli": {
	source: "apache",
	extensions: [
		"fli"
	]
},
	"video/x-flv": {
	source: "apache",
	compressible: false,
	extensions: [
		"flv"
	]
},
	"video/x-m4v": {
	source: "apache",
	extensions: [
		"m4v"
	]
},
	"video/x-matroska": {
	source: "apache",
	compressible: false,
	extensions: [
		"mkv",
		"mk3d",
		"mks"
	]
},
	"video/x-mng": {
	source: "apache",
	extensions: [
		"mng"
	]
},
	"video/x-ms-asf": {
	source: "apache",
	extensions: [
		"asf",
		"asx"
	]
},
	"video/x-ms-vob": {
	source: "apache",
	extensions: [
		"vob"
	]
},
	"video/x-ms-wm": {
	source: "apache",
	extensions: [
		"wm"
	]
},
	"video/x-ms-wmv": {
	source: "apache",
	compressible: false,
	extensions: [
		"wmv"
	]
},
	"video/x-ms-wmx": {
	source: "apache",
	extensions: [
		"wmx"
	]
},
	"video/x-ms-wvx": {
	source: "apache",
	extensions: [
		"wvx"
	]
},
	"video/x-msvideo": {
	source: "apache",
	extensions: [
		"avi"
	]
},
	"video/x-sgi-movie": {
	source: "apache",
	extensions: [
		"movie"
	]
},
	"video/x-smv": {
	source: "apache",
	extensions: [
		"smv"
	]
},
	"x-conference/x-cooltalk": {
	source: "apache",
	extensions: [
		"ice"
	]
},
	"x-shader/x-fragment": {
	compressible: true
},
	"x-shader/x-vertex": {
	compressible: true
}
};

/*!
 * mime-db
 * Copyright(c) 2014 Jonathan Ong
 * Copyright(c) 2015-2022 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 */

var mimeDb$1 = require$$0$1;

var mimeDb = mimeDb$1;

var extList$1 = function () {
	var ret = {};

	Object.keys(mimeDb).forEach(function (x) {
		var val = mimeDb[x];

		if (val.extensions && val.extensions.length > 0) {
			val.extensions.forEach(function (y) {
				ret[y] = x;
			});
		}
	});

	return ret;
};

var sortKeysLength$1 = {};

var isPlainObj = isPlainObj$2;

var sortKeys$1 = function (obj, opts) {
	if (!isPlainObj(obj)) {
		throw new TypeError('Expected a plain object');
	}

	opts = opts || {};

	// DEPRECATED
	if (typeof opts === 'function') {
		opts = {compare: opts};
	}

	var deep = opts.deep;
	var seenInput = [];
	var seenOutput = [];

	var sortKeys = function (x) {
		var seenIndex = seenInput.indexOf(x);

		if (seenIndex !== -1) {
			return seenOutput[seenIndex];
		}

		var ret = {};
		var keys = Object.keys(x).sort(opts.compare);

		seenInput.push(x);
		seenOutput.push(ret);

		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var val = x[key];

			ret[key] = deep && isPlainObj(val) ? sortKeys(val) : val;
		}

		return ret;
	};

	return sortKeys(obj);
};

var sortKeys = sortKeys$1;

/**
 * Sort object keys by length
 *
 * @param obj
 * @api public
 */

sortKeysLength$1.desc = function (obj) {
	return sortKeys(obj, function (a, b) {
		return b.length - a.length;
	});
};

sortKeysLength$1.asc = function (obj) {
	return sortKeys(obj, function (a, b) {
		return a.length - b.length;
	});
};

const extList = extList$1;
const sortKeysLength = sortKeysLength$1;

extName$1.exports = str => {
	const obj = sortKeysLength.desc(extList());
	const exts = Object.keys(obj).filter(x => str.endsWith(x));

	if (exts.length === 0) {
		return [];
	}

	return exts.map(x => ({
		ext: x,
		mime: obj[x]
	}));
};

extName$1.exports.mime = str => {
	const obj = sortKeysLength.desc(extList());
	const exts = Object.keys(obj).filter(x => obj[x] === str);

	if (exts.length === 0) {
		return [];
	}

	return exts.map(x => ({
		ext: x,
		mime: obj[x]
	}));
};

var extNameExports = extName$1.exports;

const fs$1 = require$$0$3;
const path$1 = require$$1$1;
const url = require$$0$4;
const caw = caw$1;
const contentDisposition = contentDispositionExports;
const archiveType = archiveType$1;
const decompress = decompress$1;
const filenamify = filenamify$1;
const getStream = getStreamExports;
const got = got_1;
const makeDir = makeDirExports;
const pify = pify$4;
const pEvent = pEventExports;
const fileType = fileType$1;
const extName = extNameExports;

const fsP = pify(fs$1);
const filenameFromPath = res => path$1.basename(url.parse(res.requestUrl).pathname);

const getExtFromMime = res => {
	const header = res.headers['content-type'];

	if (!header) {
		return null;
	}

	const exts = extName.mime(header);

	if (exts.length !== 1) {
		return null;
	}

	return exts[0].ext;
};

const getFilename = (res, data) => {
	const header = res.headers['content-disposition'];

	if (header) {
		const parsed = contentDisposition.parse(header);

		if (parsed.parameters && parsed.parameters.filename) {
			return parsed.parameters.filename;
		}
	}

	let filename = filenameFromPath(res);

	if (!path$1.extname(filename)) {
		const ext = (fileType(data) || {}).ext || getExtFromMime(res);

		if (ext) {
			filename = `${filename}.${ext}`;
		}
	}

	return filename;
};

const getProtocolFromUri = uri => {
	let {protocol} = url.parse(uri);

	if (protocol) {
		protocol = protocol.slice(0, -1);
	}

	return protocol;
};

var download$2 = (uri, output, opts) => {
	if (typeof output === 'object') {
		opts = output;
		output = null;
	}

	const protocol = getProtocolFromUri(uri);

	opts = Object.assign({
		encoding: null,
		rejectUnauthorized: process.env.npm_config_strict_ssl !== 'false'
	}, opts);

	const agent = caw(opts.proxy, {protocol});
	const stream = got.stream(uri, Object.assign({agent}, opts))
		.on('redirect', (response, nextOptions) => {
			const redirectProtocol = getProtocolFromUri(nextOptions.href);
			if (redirectProtocol && redirectProtocol !== protocol) {
				nextOptions.agent = caw(opts.proxy, {protocol: redirectProtocol});
			}
		});

	const promise = pEvent(stream, 'response').then(res => {
		const encoding = opts.encoding === null ? 'buffer' : opts.encoding;
		return Promise.all([getStream(stream, {encoding}), res]);
	}).then(result => {
		const [data, res] = result;

		if (!output) {
			return opts.extract && archiveType(data) ? decompress(data, opts) : data;
		}

		const filename = opts.filename || filenamify(getFilename(res, data));
		const outputFilepath = path$1.join(output, filename);

		if (opts.extract && archiveType(data)) {
			return decompress(data, path$1.dirname(outputFilepath), opts);
		}

		return makeDir(path$1.dirname(outputFilepath))
			.then(() => fsP.writeFile(outputFilepath, data))
			.then(() => data);
	});

	stream.then = promise.then.bind(promise);
	stream.catch = promise.catch.bind(promise);

	return stream;
};

var spawn = require$$0$a.spawn;

var gitClone = function(repo, targetPath, opts, cb) {

    if (typeof opts === 'function') {
        cb = opts;
        opts = null;
    }

    opts = opts || {};

    var git = opts.git || 'git';
    var args = ['clone'];

    if (opts.shallow) {
        args.push('--depth');
        args.push('1');
    }

    args.push('--');
    args.push(repo);
    args.push(targetPath);

    var process = spawn(git, args);
    process.on('close', function(status) {
        if (status == 0) {
            if (opts.checkout) {
                _checkout();
            } else {
                cb && cb();    
            }
        } else {
            cb && cb(new Error("'git clone' failed with status " + status));
        }
    });

    function _checkout() {
        var args = ['checkout', opts.checkout];
        var process = spawn(git, args, { cwd: targetPath });
        process.on('close', function(status) {
            if (status == 0) {
                cb && cb();
            } else {
                cb && cb(new Error("'git checkout' failed with status " + status));
            }
        });
    }

};

var old = {};

var hasRequiredOld;

function requireOld () {
	if (hasRequiredOld) return old;
	hasRequiredOld = 1;
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	var pathModule = require$$1$1;
	var isWindows = process.platform === 'win32';
	var fs = require$$0$3;

	// JavaScript implementation of realpath, ported from node pre-v6

	var DEBUG = process.env.NODE_DEBUG && /fs/.test(process.env.NODE_DEBUG);

	function rethrow() {
	  // Only enable in debug mode. A backtrace uses ~1000 bytes of heap space and
	  // is fairly slow to generate.
	  var callback;
	  if (DEBUG) {
	    var backtrace = new Error;
	    callback = debugCallback;
	  } else
	    callback = missingCallback;

	  return callback;

	  function debugCallback(err) {
	    if (err) {
	      backtrace.message = err.message;
	      err = backtrace;
	      missingCallback(err);
	    }
	  }

	  function missingCallback(err) {
	    if (err) {
	      if (process.throwDeprecation)
	        throw err;  // Forgot a callback but don't know where? Use NODE_DEBUG=fs
	      else if (!process.noDeprecation) {
	        var msg = 'fs: missing callback ' + (err.stack || err.message);
	        if (process.traceDeprecation)
	          console.trace(msg);
	        else
	          console.error(msg);
	      }
	    }
	  }
	}

	function maybeCallback(cb) {
	  return typeof cb === 'function' ? cb : rethrow();
	}

	pathModule.normalize;

	// Regexp that finds the next partion of a (partial) path
	// result is [base_with_slash, base], e.g. ['somedir/', 'somedir']
	if (isWindows) {
	  var nextPartRe = /(.*?)(?:[\/\\]+|$)/g;
	} else {
	  var nextPartRe = /(.*?)(?:[\/]+|$)/g;
	}

	// Regex to find the device root, including trailing slash. E.g. 'c:\\'.
	if (isWindows) {
	  var splitRootRe = /^(?:[a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/][^\\\/]+)?[\\\/]*/;
	} else {
	  var splitRootRe = /^[\/]*/;
	}

	old.realpathSync = function realpathSync(p, cache) {
	  // make p is absolute
	  p = pathModule.resolve(p);

	  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
	    return cache[p];
	  }

	  var original = p,
	      seenLinks = {},
	      knownHard = {};

	  // current character position in p
	  var pos;
	  // the partial path so far, including a trailing slash if any
	  var current;
	  // the partial path without a trailing slash (except when pointing at a root)
	  var base;
	  // the partial path scanned in the previous round, with slash
	  var previous;

	  start();

	  function start() {
	    // Skip over roots
	    var m = splitRootRe.exec(p);
	    pos = m[0].length;
	    current = m[0];
	    base = m[0];
	    previous = '';

	    // On windows, check that the root exists. On unix there is no need.
	    if (isWindows && !knownHard[base]) {
	      fs.lstatSync(base);
	      knownHard[base] = true;
	    }
	  }

	  // walk down the path, swapping out linked pathparts for their real
	  // values
	  // NB: p.length changes.
	  while (pos < p.length) {
	    // find the next part
	    nextPartRe.lastIndex = pos;
	    var result = nextPartRe.exec(p);
	    previous = current;
	    current += result[0];
	    base = previous + result[1];
	    pos = nextPartRe.lastIndex;

	    // continue if not a symlink
	    if (knownHard[base] || (cache && cache[base] === base)) {
	      continue;
	    }

	    var resolvedLink;
	    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
	      // some known symbolic link.  no need to stat again.
	      resolvedLink = cache[base];
	    } else {
	      var stat = fs.lstatSync(base);
	      if (!stat.isSymbolicLink()) {
	        knownHard[base] = true;
	        if (cache) cache[base] = base;
	        continue;
	      }

	      // read the link if it wasn't read before
	      // dev/ino always return 0 on windows, so skip the check.
	      var linkTarget = null;
	      if (!isWindows) {
	        var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
	        if (seenLinks.hasOwnProperty(id)) {
	          linkTarget = seenLinks[id];
	        }
	      }
	      if (linkTarget === null) {
	        fs.statSync(base);
	        linkTarget = fs.readlinkSync(base);
	      }
	      resolvedLink = pathModule.resolve(previous, linkTarget);
	      // track this, if given a cache.
	      if (cache) cache[base] = resolvedLink;
	      if (!isWindows) seenLinks[id] = linkTarget;
	    }

	    // resolve the link, then start over
	    p = pathModule.resolve(resolvedLink, p.slice(pos));
	    start();
	  }

	  if (cache) cache[original] = p;

	  return p;
	};


	old.realpath = function realpath(p, cache, cb) {
	  if (typeof cb !== 'function') {
	    cb = maybeCallback(cache);
	    cache = null;
	  }

	  // make p is absolute
	  p = pathModule.resolve(p);

	  if (cache && Object.prototype.hasOwnProperty.call(cache, p)) {
	    return process.nextTick(cb.bind(null, null, cache[p]));
	  }

	  var original = p,
	      seenLinks = {},
	      knownHard = {};

	  // current character position in p
	  var pos;
	  // the partial path so far, including a trailing slash if any
	  var current;
	  // the partial path without a trailing slash (except when pointing at a root)
	  var base;
	  // the partial path scanned in the previous round, with slash
	  var previous;

	  start();

	  function start() {
	    // Skip over roots
	    var m = splitRootRe.exec(p);
	    pos = m[0].length;
	    current = m[0];
	    base = m[0];
	    previous = '';

	    // On windows, check that the root exists. On unix there is no need.
	    if (isWindows && !knownHard[base]) {
	      fs.lstat(base, function(err) {
	        if (err) return cb(err);
	        knownHard[base] = true;
	        LOOP();
	      });
	    } else {
	      process.nextTick(LOOP);
	    }
	  }

	  // walk down the path, swapping out linked pathparts for their real
	  // values
	  function LOOP() {
	    // stop if scanned past end of path
	    if (pos >= p.length) {
	      if (cache) cache[original] = p;
	      return cb(null, p);
	    }

	    // find the next part
	    nextPartRe.lastIndex = pos;
	    var result = nextPartRe.exec(p);
	    previous = current;
	    current += result[0];
	    base = previous + result[1];
	    pos = nextPartRe.lastIndex;

	    // continue if not a symlink
	    if (knownHard[base] || (cache && cache[base] === base)) {
	      return process.nextTick(LOOP);
	    }

	    if (cache && Object.prototype.hasOwnProperty.call(cache, base)) {
	      // known symbolic link.  no need to stat again.
	      return gotResolvedLink(cache[base]);
	    }

	    return fs.lstat(base, gotStat);
	  }

	  function gotStat(err, stat) {
	    if (err) return cb(err);

	    // if not a symlink, skip to the next path part
	    if (!stat.isSymbolicLink()) {
	      knownHard[base] = true;
	      if (cache) cache[base] = base;
	      return process.nextTick(LOOP);
	    }

	    // stat & read the link if not read before
	    // call gotTarget as soon as the link target is known
	    // dev/ino always return 0 on windows, so skip the check.
	    if (!isWindows) {
	      var id = stat.dev.toString(32) + ':' + stat.ino.toString(32);
	      if (seenLinks.hasOwnProperty(id)) {
	        return gotTarget(null, seenLinks[id], base);
	      }
	    }
	    fs.stat(base, function(err) {
	      if (err) return cb(err);

	      fs.readlink(base, function(err, target) {
	        if (!isWindows) seenLinks[id] = target;
	        gotTarget(err, target);
	      });
	    });
	  }

	  function gotTarget(err, target, base) {
	    if (err) return cb(err);

	    var resolvedLink = pathModule.resolve(previous, target);
	    if (cache) cache[base] = resolvedLink;
	    gotResolvedLink(resolvedLink);
	  }

	  function gotResolvedLink(resolvedLink) {
	    // resolve the link, then start over
	    p = pathModule.resolve(resolvedLink, p.slice(pos));
	    start();
	  }
	};
	return old;
}

var fs_realpath;
var hasRequiredFs_realpath;

function requireFs_realpath () {
	if (hasRequiredFs_realpath) return fs_realpath;
	hasRequiredFs_realpath = 1;
	fs_realpath = realpath;
	realpath.realpath = realpath;
	realpath.sync = realpathSync;
	realpath.realpathSync = realpathSync;
	realpath.monkeypatch = monkeypatch;
	realpath.unmonkeypatch = unmonkeypatch;

	var fs = require$$0$3;
	var origRealpath = fs.realpath;
	var origRealpathSync = fs.realpathSync;

	var version = process.version;
	var ok = /^v[0-5]\./.test(version);
	var old = requireOld();

	function newError (er) {
	  return er && er.syscall === 'realpath' && (
	    er.code === 'ELOOP' ||
	    er.code === 'ENOMEM' ||
	    er.code === 'ENAMETOOLONG'
	  )
	}

	function realpath (p, cache, cb) {
	  if (ok) {
	    return origRealpath(p, cache, cb)
	  }

	  if (typeof cache === 'function') {
	    cb = cache;
	    cache = null;
	  }
	  origRealpath(p, cache, function (er, result) {
	    if (newError(er)) {
	      old.realpath(p, cache, cb);
	    } else {
	      cb(er, result);
	    }
	  });
	}

	function realpathSync (p, cache) {
	  if (ok) {
	    return origRealpathSync(p, cache)
	  }

	  try {
	    return origRealpathSync(p, cache)
	  } catch (er) {
	    if (newError(er)) {
	      return old.realpathSync(p, cache)
	    } else {
	      throw er
	    }
	  }
	}

	function monkeypatch () {
	  fs.realpath = realpath;
	  fs.realpathSync = realpathSync;
	}

	function unmonkeypatch () {
	  fs.realpath = origRealpath;
	  fs.realpathSync = origRealpathSync;
	}
	return fs_realpath;
}

var concatMap;
var hasRequiredConcatMap;

function requireConcatMap () {
	if (hasRequiredConcatMap) return concatMap;
	hasRequiredConcatMap = 1;
	concatMap = function (xs, fn) {
	    var res = [];
	    for (var i = 0; i < xs.length; i++) {
	        var x = fn(xs[i], i);
	        if (isArray(x)) res.push.apply(res, x);
	        else res.push(x);
	    }
	    return res;
	};

	var isArray = Array.isArray || function (xs) {
	    return Object.prototype.toString.call(xs) === '[object Array]';
	};
	return concatMap;
}

var balancedMatch;
var hasRequiredBalancedMatch;

function requireBalancedMatch () {
	if (hasRequiredBalancedMatch) return balancedMatch;
	hasRequiredBalancedMatch = 1;
	balancedMatch = balanced;
	function balanced(a, b, str) {
	  if (a instanceof RegExp) a = maybeMatch(a, str);
	  if (b instanceof RegExp) b = maybeMatch(b, str);

	  var r = range(a, b, str);

	  return r && {
	    start: r[0],
	    end: r[1],
	    pre: str.slice(0, r[0]),
	    body: str.slice(r[0] + a.length, r[1]),
	    post: str.slice(r[1] + b.length)
	  };
	}

	function maybeMatch(reg, str) {
	  var m = str.match(reg);
	  return m ? m[0] : null;
	}

	balanced.range = range;
	function range(a, b, str) {
	  var begs, beg, left, right, result;
	  var ai = str.indexOf(a);
	  var bi = str.indexOf(b, ai + 1);
	  var i = ai;

	  if (ai >= 0 && bi > 0) {
	    if(a===b) {
	      return [ai, bi];
	    }
	    begs = [];
	    left = str.length;

	    while (i >= 0 && !result) {
	      if (i == ai) {
	        begs.push(i);
	        ai = str.indexOf(a, i + 1);
	      } else if (begs.length == 1) {
	        result = [ begs.pop(), bi ];
	      } else {
	        beg = begs.pop();
	        if (beg < left) {
	          left = beg;
	          right = bi;
	        }

	        bi = str.indexOf(b, i + 1);
	      }

	      i = ai < bi && ai >= 0 ? ai : bi;
	    }

	    if (begs.length) {
	      result = [ left, right ];
	    }
	  }

	  return result;
	}
	return balancedMatch;
}

var braceExpansion;
var hasRequiredBraceExpansion;

function requireBraceExpansion () {
	if (hasRequiredBraceExpansion) return braceExpansion;
	hasRequiredBraceExpansion = 1;
	var concatMap = requireConcatMap();
	var balanced = requireBalancedMatch();

	braceExpansion = expandTop;

	var escSlash = '\0SLASH'+Math.random()+'\0';
	var escOpen = '\0OPEN'+Math.random()+'\0';
	var escClose = '\0CLOSE'+Math.random()+'\0';
	var escComma = '\0COMMA'+Math.random()+'\0';
	var escPeriod = '\0PERIOD'+Math.random()+'\0';

	function numeric(str) {
	  return parseInt(str, 10) == str
	    ? parseInt(str, 10)
	    : str.charCodeAt(0);
	}

	function escapeBraces(str) {
	  return str.split('\\\\').join(escSlash)
	            .split('\\{').join(escOpen)
	            .split('\\}').join(escClose)
	            .split('\\,').join(escComma)
	            .split('\\.').join(escPeriod);
	}

	function unescapeBraces(str) {
	  return str.split(escSlash).join('\\')
	            .split(escOpen).join('{')
	            .split(escClose).join('}')
	            .split(escComma).join(',')
	            .split(escPeriod).join('.');
	}


	// Basically just str.split(","), but handling cases
	// where we have nested braced sections, which should be
	// treated as individual members, like {a,{b,c},d}
	function parseCommaParts(str) {
	  if (!str)
	    return [''];

	  var parts = [];
	  var m = balanced('{', '}', str);

	  if (!m)
	    return str.split(',');

	  var pre = m.pre;
	  var body = m.body;
	  var post = m.post;
	  var p = pre.split(',');

	  p[p.length-1] += '{' + body + '}';
	  var postParts = parseCommaParts(post);
	  if (post.length) {
	    p[p.length-1] += postParts.shift();
	    p.push.apply(p, postParts);
	  }

	  parts.push.apply(parts, p);

	  return parts;
	}

	function expandTop(str) {
	  if (!str)
	    return [];

	  // I don't know why Bash 4.3 does this, but it does.
	  // Anything starting with {} will have the first two bytes preserved
	  // but *only* at the top level, so {},a}b will not expand to anything,
	  // but a{},b}c will be expanded to [a}c,abc].
	  // One could argue that this is a bug in Bash, but since the goal of
	  // this module is to match Bash's rules, we escape a leading {}
	  if (str.substr(0, 2) === '{}') {
	    str = '\\{\\}' + str.substr(2);
	  }

	  return expand(escapeBraces(str), true).map(unescapeBraces);
	}

	function embrace(str) {
	  return '{' + str + '}';
	}
	function isPadded(el) {
	  return /^-?0\d/.test(el);
	}

	function lte(i, y) {
	  return i <= y;
	}
	function gte(i, y) {
	  return i >= y;
	}

	function expand(str, isTop) {
	  var expansions = [];

	  var m = balanced('{', '}', str);
	  if (!m || /\$$/.test(m.pre)) return [str];

	  var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
	  var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
	  var isSequence = isNumericSequence || isAlphaSequence;
	  var isOptions = m.body.indexOf(',') >= 0;
	  if (!isSequence && !isOptions) {
	    // {a},b}
	    if (m.post.match(/,.*\}/)) {
	      str = m.pre + '{' + m.body + escClose + m.post;
	      return expand(str);
	    }
	    return [str];
	  }

	  var n;
	  if (isSequence) {
	    n = m.body.split(/\.\./);
	  } else {
	    n = parseCommaParts(m.body);
	    if (n.length === 1) {
	      // x{{a,b}}y ==> x{a}y x{b}y
	      n = expand(n[0], false).map(embrace);
	      if (n.length === 1) {
	        var post = m.post.length
	          ? expand(m.post, false)
	          : [''];
	        return post.map(function(p) {
	          return m.pre + n[0] + p;
	        });
	      }
	    }
	  }

	  // at this point, n is the parts, and we know it's not a comma set
	  // with a single entry.

	  // no need to expand pre, since it is guaranteed to be free of brace-sets
	  var pre = m.pre;
	  var post = m.post.length
	    ? expand(m.post, false)
	    : [''];

	  var N;

	  if (isSequence) {
	    var x = numeric(n[0]);
	    var y = numeric(n[1]);
	    var width = Math.max(n[0].length, n[1].length);
	    var incr = n.length == 3
	      ? Math.abs(numeric(n[2]))
	      : 1;
	    var test = lte;
	    var reverse = y < x;
	    if (reverse) {
	      incr *= -1;
	      test = gte;
	    }
	    var pad = n.some(isPadded);

	    N = [];

	    for (var i = x; test(i, y); i += incr) {
	      var c;
	      if (isAlphaSequence) {
	        c = String.fromCharCode(i);
	        if (c === '\\')
	          c = '';
	      } else {
	        c = String(i);
	        if (pad) {
	          var need = width - c.length;
	          if (need > 0) {
	            var z = new Array(need + 1).join('0');
	            if (i < 0)
	              c = '-' + z + c.slice(1);
	            else
	              c = z + c;
	          }
	        }
	      }
	      N.push(c);
	    }
	  } else {
	    N = concatMap(n, function(el) { return expand(el, false) });
	  }

	  for (var j = 0; j < N.length; j++) {
	    for (var k = 0; k < post.length; k++) {
	      var expansion = pre + N[j] + post[k];
	      if (!isTop || isSequence || expansion)
	        expansions.push(expansion);
	    }
	  }

	  return expansions;
	}
	return braceExpansion;
}

var minimatch_1;
var hasRequiredMinimatch;

function requireMinimatch () {
	if (hasRequiredMinimatch) return minimatch_1;
	hasRequiredMinimatch = 1;
	minimatch_1 = minimatch;
	minimatch.Minimatch = Minimatch;

	var path = (function () { try { return require('path') } catch (e) {}}()) || {
	  sep: '/'
	};
	minimatch.sep = path.sep;

	var GLOBSTAR = minimatch.GLOBSTAR = Minimatch.GLOBSTAR = {};
	var expand = requireBraceExpansion();

	var plTypes = {
	  '!': { open: '(?:(?!(?:', close: '))[^/]*?)'},
	  '?': { open: '(?:', close: ')?' },
	  '+': { open: '(?:', close: ')+' },
	  '*': { open: '(?:', close: ')*' },
	  '@': { open: '(?:', close: ')' }
	};

	// any single thing other than /
	// don't need to escape / when using new RegExp()
	var qmark = '[^/]';

	// * => any number of characters
	var star = qmark + '*?';

	// ** when dots are allowed.  Anything goes, except .. and .
	// not (^ or / followed by one or two dots followed by $ or /),
	// followed by anything, any number of times.
	var twoStarDot = '(?:(?!(?:\\\/|^)(?:\\.{1,2})($|\\\/)).)*?';

	// not a ^ or / followed by a dot,
	// followed by anything, any number of times.
	var twoStarNoDot = '(?:(?!(?:\\\/|^)\\.).)*?';

	// characters that need to be escaped in RegExp.
	var reSpecials = charSet('().*{}+?[]^$\\!');

	// "abc" -> { a:true, b:true, c:true }
	function charSet (s) {
	  return s.split('').reduce(function (set, c) {
	    set[c] = true;
	    return set
	  }, {})
	}

	// normalizes slashes.
	var slashSplit = /\/+/;

	minimatch.filter = filter;
	function filter (pattern, options) {
	  options = options || {};
	  return function (p, i, list) {
	    return minimatch(p, pattern, options)
	  }
	}

	function ext (a, b) {
	  b = b || {};
	  var t = {};
	  Object.keys(a).forEach(function (k) {
	    t[k] = a[k];
	  });
	  Object.keys(b).forEach(function (k) {
	    t[k] = b[k];
	  });
	  return t
	}

	minimatch.defaults = function (def) {
	  if (!def || typeof def !== 'object' || !Object.keys(def).length) {
	    return minimatch
	  }

	  var orig = minimatch;

	  var m = function minimatch (p, pattern, options) {
	    return orig(p, pattern, ext(def, options))
	  };

	  m.Minimatch = function Minimatch (pattern, options) {
	    return new orig.Minimatch(pattern, ext(def, options))
	  };
	  m.Minimatch.defaults = function defaults (options) {
	    return orig.defaults(ext(def, options)).Minimatch
	  };

	  m.filter = function filter (pattern, options) {
	    return orig.filter(pattern, ext(def, options))
	  };

	  m.defaults = function defaults (options) {
	    return orig.defaults(ext(def, options))
	  };

	  m.makeRe = function makeRe (pattern, options) {
	    return orig.makeRe(pattern, ext(def, options))
	  };

	  m.braceExpand = function braceExpand (pattern, options) {
	    return orig.braceExpand(pattern, ext(def, options))
	  };

	  m.match = function (list, pattern, options) {
	    return orig.match(list, pattern, ext(def, options))
	  };

	  return m
	};

	Minimatch.defaults = function (def) {
	  return minimatch.defaults(def).Minimatch
	};

	function minimatch (p, pattern, options) {
	  assertValidPattern(pattern);

	  if (!options) options = {};

	  // shortcut: comments match nothing.
	  if (!options.nocomment && pattern.charAt(0) === '#') {
	    return false
	  }

	  return new Minimatch(pattern, options).match(p)
	}

	function Minimatch (pattern, options) {
	  if (!(this instanceof Minimatch)) {
	    return new Minimatch(pattern, options)
	  }

	  assertValidPattern(pattern);

	  if (!options) options = {};

	  pattern = pattern.trim();

	  // windows support: need to use /, not \
	  if (!options.allowWindowsEscape && path.sep !== '/') {
	    pattern = pattern.split(path.sep).join('/');
	  }

	  this.options = options;
	  this.set = [];
	  this.pattern = pattern;
	  this.regexp = null;
	  this.negate = false;
	  this.comment = false;
	  this.empty = false;
	  this.partial = !!options.partial;

	  // make the set of regexps etc.
	  this.make();
	}

	Minimatch.prototype.debug = function () {};

	Minimatch.prototype.make = make;
	function make () {
	  var pattern = this.pattern;
	  var options = this.options;

	  // empty patterns and comments match nothing.
	  if (!options.nocomment && pattern.charAt(0) === '#') {
	    this.comment = true;
	    return
	  }
	  if (!pattern) {
	    this.empty = true;
	    return
	  }

	  // step 1: figure out negation, etc.
	  this.parseNegate();

	  // step 2: expand braces
	  var set = this.globSet = this.braceExpand();

	  if (options.debug) this.debug = function debug() { console.error.apply(console, arguments); };

	  this.debug(this.pattern, set);

	  // step 3: now we have a set, so turn each one into a series of path-portion
	  // matching patterns.
	  // These will be regexps, except in the case of "**", which is
	  // set to the GLOBSTAR object for globstar behavior,
	  // and will not contain any / characters
	  set = this.globParts = set.map(function (s) {
	    return s.split(slashSplit)
	  });

	  this.debug(this.pattern, set);

	  // glob --> regexps
	  set = set.map(function (s, si, set) {
	    return s.map(this.parse, this)
	  }, this);

	  this.debug(this.pattern, set);

	  // filter out everything that didn't compile properly.
	  set = set.filter(function (s) {
	    return s.indexOf(false) === -1
	  });

	  this.debug(this.pattern, set);

	  this.set = set;
	}

	Minimatch.prototype.parseNegate = parseNegate;
	function parseNegate () {
	  var pattern = this.pattern;
	  var negate = false;
	  var options = this.options;
	  var negateOffset = 0;

	  if (options.nonegate) return

	  for (var i = 0, l = pattern.length
	    ; i < l && pattern.charAt(i) === '!'
	    ; i++) {
	    negate = !negate;
	    negateOffset++;
	  }

	  if (negateOffset) this.pattern = pattern.substr(negateOffset);
	  this.negate = negate;
	}

	// Brace expansion:
	// a{b,c}d -> abd acd
	// a{b,}c -> abc ac
	// a{0..3}d -> a0d a1d a2d a3d
	// a{b,c{d,e}f}g -> abg acdfg acefg
	// a{b,c}d{e,f}g -> abdeg acdeg abdeg abdfg
	//
	// Invalid sets are not expanded.
	// a{2..}b -> a{2..}b
	// a{b}c -> a{b}c
	minimatch.braceExpand = function (pattern, options) {
	  return braceExpand(pattern, options)
	};

	Minimatch.prototype.braceExpand = braceExpand;

	function braceExpand (pattern, options) {
	  if (!options) {
	    if (this instanceof Minimatch) {
	      options = this.options;
	    } else {
	      options = {};
	    }
	  }

	  pattern = typeof pattern === 'undefined'
	    ? this.pattern : pattern;

	  assertValidPattern(pattern);

	  // Thanks to Yeting Li <https://github.com/yetingli> for
	  // improving this regexp to avoid a ReDOS vulnerability.
	  if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
	    // shortcut. no need to expand.
	    return [pattern]
	  }

	  return expand(pattern)
	}

	var MAX_PATTERN_LENGTH = 1024 * 64;
	var assertValidPattern = function (pattern) {
	  if (typeof pattern !== 'string') {
	    throw new TypeError('invalid pattern')
	  }

	  if (pattern.length > MAX_PATTERN_LENGTH) {
	    throw new TypeError('pattern is too long')
	  }
	};

	// parse a component of the expanded set.
	// At this point, no pattern may contain "/" in it
	// so we're going to return a 2d array, where each entry is the full
	// pattern, split on '/', and then turned into a regular expression.
	// A regexp is made at the end which joins each array with an
	// escaped /, and another full one which joins each regexp with |.
	//
	// Following the lead of Bash 4.1, note that "**" only has special meaning
	// when it is the *only* thing in a path portion.  Otherwise, any series
	// of * is equivalent to a single *.  Globstar behavior is enabled by
	// default, and can be disabled by setting options.noglobstar.
	Minimatch.prototype.parse = parse;
	var SUBPARSE = {};
	function parse (pattern, isSub) {
	  assertValidPattern(pattern);

	  var options = this.options;

	  // shortcuts
	  if (pattern === '**') {
	    if (!options.noglobstar)
	      return GLOBSTAR
	    else
	      pattern = '*';
	  }
	  if (pattern === '') return ''

	  var re = '';
	  var hasMagic = !!options.nocase;
	  var escaping = false;
	  // ? => one single character
	  var patternListStack = [];
	  var negativeLists = [];
	  var stateChar;
	  var inClass = false;
	  var reClassStart = -1;
	  var classStart = -1;
	  // . and .. never match anything that doesn't start with .,
	  // even when options.dot is set.
	  var patternStart = pattern.charAt(0) === '.' ? '' // anything
	  // not (start or / followed by . or .. followed by / or end)
	  : options.dot ? '(?!(?:^|\\\/)\\.{1,2}(?:$|\\\/))'
	  : '(?!\\.)';
	  var self = this;

	  function clearStateChar () {
	    if (stateChar) {
	      // we had some state-tracking character
	      // that wasn't consumed by this pass.
	      switch (stateChar) {
	        case '*':
	          re += star;
	          hasMagic = true;
	        break
	        case '?':
	          re += qmark;
	          hasMagic = true;
	        break
	        default:
	          re += '\\' + stateChar;
	        break
	      }
	      self.debug('clearStateChar %j %j', stateChar, re);
	      stateChar = false;
	    }
	  }

	  for (var i = 0, len = pattern.length, c
	    ; (i < len) && (c = pattern.charAt(i))
	    ; i++) {
	    this.debug('%s\t%s %s %j', pattern, i, re, c);

	    // skip over any that are escaped.
	    if (escaping && reSpecials[c]) {
	      re += '\\' + c;
	      escaping = false;
	      continue
	    }

	    switch (c) {
	      /* istanbul ignore next */
	      case '/': {
	        // completely not allowed, even escaped.
	        // Should already be path-split by now.
	        return false
	      }

	      case '\\':
	        clearStateChar();
	        escaping = true;
	      continue

	      // the various stateChar values
	      // for the "extglob" stuff.
	      case '?':
	      case '*':
	      case '+':
	      case '@':
	      case '!':
	        this.debug('%s\t%s %s %j <-- stateChar', pattern, i, re, c);

	        // all of those are literals inside a class, except that
	        // the glob [!a] means [^a] in regexp
	        if (inClass) {
	          this.debug('  in class');
	          if (c === '!' && i === classStart + 1) c = '^';
	          re += c;
	          continue
	        }

	        // if we already have a stateChar, then it means
	        // that there was something like ** or +? in there.
	        // Handle the stateChar, then proceed with this one.
	        self.debug('call clearStateChar %j', stateChar);
	        clearStateChar();
	        stateChar = c;
	        // if extglob is disabled, then +(asdf|foo) isn't a thing.
	        // just clear the statechar *now*, rather than even diving into
	        // the patternList stuff.
	        if (options.noext) clearStateChar();
	      continue

	      case '(':
	        if (inClass) {
	          re += '(';
	          continue
	        }

	        if (!stateChar) {
	          re += '\\(';
	          continue
	        }

	        patternListStack.push({
	          type: stateChar,
	          start: i - 1,
	          reStart: re.length,
	          open: plTypes[stateChar].open,
	          close: plTypes[stateChar].close
	        });
	        // negation is (?:(?!js)[^/]*)
	        re += stateChar === '!' ? '(?:(?!(?:' : '(?:';
	        this.debug('plType %j %j', stateChar, re);
	        stateChar = false;
	      continue

	      case ')':
	        if (inClass || !patternListStack.length) {
	          re += '\\)';
	          continue
	        }

	        clearStateChar();
	        hasMagic = true;
	        var pl = patternListStack.pop();
	        // negation is (?:(?!js)[^/]*)
	        // The others are (?:<pattern>)<type>
	        re += pl.close;
	        if (pl.type === '!') {
	          negativeLists.push(pl);
	        }
	        pl.reEnd = re.length;
	      continue

	      case '|':
	        if (inClass || !patternListStack.length || escaping) {
	          re += '\\|';
	          escaping = false;
	          continue
	        }

	        clearStateChar();
	        re += '|';
	      continue

	      // these are mostly the same in regexp and glob
	      case '[':
	        // swallow any state-tracking char before the [
	        clearStateChar();

	        if (inClass) {
	          re += '\\' + c;
	          continue
	        }

	        inClass = true;
	        classStart = i;
	        reClassStart = re.length;
	        re += c;
	      continue

	      case ']':
	        //  a right bracket shall lose its special
	        //  meaning and represent itself in
	        //  a bracket expression if it occurs
	        //  first in the list.  -- POSIX.2 2.8.3.2
	        if (i === classStart + 1 || !inClass) {
	          re += '\\' + c;
	          escaping = false;
	          continue
	        }

	        // handle the case where we left a class open.
	        // "[z-a]" is valid, equivalent to "\[z-a\]"
	        // split where the last [ was, make sure we don't have
	        // an invalid re. if so, re-walk the contents of the
	        // would-be class to re-translate any characters that
	        // were passed through as-is
	        // TODO: It would probably be faster to determine this
	        // without a try/catch and a new RegExp, but it's tricky
	        // to do safely.  For now, this is safe and works.
	        var cs = pattern.substring(classStart + 1, i);
	        try {
	          RegExp('[' + cs + ']');
	        } catch (er) {
	          // not a valid class!
	          var sp = this.parse(cs, SUBPARSE);
	          re = re.substr(0, reClassStart) + '\\[' + sp[0] + '\\]';
	          hasMagic = hasMagic || sp[1];
	          inClass = false;
	          continue
	        }

	        // finish up the class.
	        hasMagic = true;
	        inClass = false;
	        re += c;
	      continue

	      default:
	        // swallow any state char that wasn't consumed
	        clearStateChar();

	        if (escaping) {
	          // no need
	          escaping = false;
	        } else if (reSpecials[c]
	          && !(c === '^' && inClass)) {
	          re += '\\';
	        }

	        re += c;

	    } // switch
	  } // for

	  // handle the case where we left a class open.
	  // "[abc" is valid, equivalent to "\[abc"
	  if (inClass) {
	    // split where the last [ was, and escape it
	    // this is a huge pita.  We now have to re-walk
	    // the contents of the would-be class to re-translate
	    // any characters that were passed through as-is
	    cs = pattern.substr(classStart + 1);
	    sp = this.parse(cs, SUBPARSE);
	    re = re.substr(0, reClassStart) + '\\[' + sp[0];
	    hasMagic = hasMagic || sp[1];
	  }

	  // handle the case where we had a +( thing at the *end*
	  // of the pattern.
	  // each pattern list stack adds 3 chars, and we need to go through
	  // and escape any | chars that were passed through as-is for the regexp.
	  // Go through and escape them, taking care not to double-escape any
	  // | chars that were already escaped.
	  for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
	    var tail = re.slice(pl.reStart + pl.open.length);
	    this.debug('setting tail', re, pl);
	    // maybe some even number of \, then maybe 1 \, followed by a |
	    tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, function (_, $1, $2) {
	      if (!$2) {
	        // the | isn't already escaped, so escape it.
	        $2 = '\\';
	      }

	      // need to escape all those slashes *again*, without escaping the
	      // one that we need for escaping the | character.  As it works out,
	      // escaping an even number of slashes can be done by simply repeating
	      // it exactly after itself.  That's why this trick works.
	      //
	      // I am sorry that you have to see this.
	      return $1 + $1 + $2 + '|'
	    });

	    this.debug('tail=%j\n   %s', tail, tail, pl, re);
	    var t = pl.type === '*' ? star
	      : pl.type === '?' ? qmark
	      : '\\' + pl.type;

	    hasMagic = true;
	    re = re.slice(0, pl.reStart) + t + '\\(' + tail;
	  }

	  // handle trailing things that only matter at the very end.
	  clearStateChar();
	  if (escaping) {
	    // trailing \\
	    re += '\\\\';
	  }

	  // only need to apply the nodot start if the re starts with
	  // something that could conceivably capture a dot
	  var addPatternStart = false;
	  switch (re.charAt(0)) {
	    case '[': case '.': case '(': addPatternStart = true;
	  }

	  // Hack to work around lack of negative lookbehind in JS
	  // A pattern like: *.!(x).!(y|z) needs to ensure that a name
	  // like 'a.xyz.yz' doesn't match.  So, the first negative
	  // lookahead, has to look ALL the way ahead, to the end of
	  // the pattern.
	  for (var n = negativeLists.length - 1; n > -1; n--) {
	    var nl = negativeLists[n];

	    var nlBefore = re.slice(0, nl.reStart);
	    var nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
	    var nlLast = re.slice(nl.reEnd - 8, nl.reEnd);
	    var nlAfter = re.slice(nl.reEnd);

	    nlLast += nlAfter;

	    // Handle nested stuff like *(*.js|!(*.json)), where open parens
	    // mean that we should *not* include the ) in the bit that is considered
	    // "after" the negated section.
	    var openParensBefore = nlBefore.split('(').length - 1;
	    var cleanAfter = nlAfter;
	    for (i = 0; i < openParensBefore; i++) {
	      cleanAfter = cleanAfter.replace(/\)[+*?]?/, '');
	    }
	    nlAfter = cleanAfter;

	    var dollar = '';
	    if (nlAfter === '' && isSub !== SUBPARSE) {
	      dollar = '$';
	    }
	    var newRe = nlBefore + nlFirst + nlAfter + dollar + nlLast;
	    re = newRe;
	  }

	  // if the re is not "" at this point, then we need to make sure
	  // it doesn't match against an empty path part.
	  // Otherwise a/* will match a/, which it should not.
	  if (re !== '' && hasMagic) {
	    re = '(?=.)' + re;
	  }

	  if (addPatternStart) {
	    re = patternStart + re;
	  }

	  // parsing just a piece of a larger pattern.
	  if (isSub === SUBPARSE) {
	    return [re, hasMagic]
	  }

	  // skip the regexp for non-magical patterns
	  // unescape anything in it, though, so that it'll be
	  // an exact match against a file etc.
	  if (!hasMagic) {
	    return globUnescape(pattern)
	  }

	  var flags = options.nocase ? 'i' : '';
	  try {
	    var regExp = new RegExp('^' + re + '$', flags);
	  } catch (er) /* istanbul ignore next - should be impossible */ {
	    // If it was an invalid regular expression, then it can't match
	    // anything.  This trick looks for a character after the end of
	    // the string, which is of course impossible, except in multi-line
	    // mode, but it's not a /m regex.
	    return new RegExp('$.')
	  }

	  regExp._glob = pattern;
	  regExp._src = re;

	  return regExp
	}

	minimatch.makeRe = function (pattern, options) {
	  return new Minimatch(pattern, options || {}).makeRe()
	};

	Minimatch.prototype.makeRe = makeRe;
	function makeRe () {
	  if (this.regexp || this.regexp === false) return this.regexp

	  // at this point, this.set is a 2d array of partial
	  // pattern strings, or "**".
	  //
	  // It's better to use .match().  This function shouldn't
	  // be used, really, but it's pretty convenient sometimes,
	  // when you just want to work with a regex.
	  var set = this.set;

	  if (!set.length) {
	    this.regexp = false;
	    return this.regexp
	  }
	  var options = this.options;

	  var twoStar = options.noglobstar ? star
	    : options.dot ? twoStarDot
	    : twoStarNoDot;
	  var flags = options.nocase ? 'i' : '';

	  var re = set.map(function (pattern) {
	    return pattern.map(function (p) {
	      return (p === GLOBSTAR) ? twoStar
	      : (typeof p === 'string') ? regExpEscape(p)
	      : p._src
	    }).join('\\\/')
	  }).join('|');

	  // must match entire pattern
	  // ending in a * or ** will make it less strict.
	  re = '^(?:' + re + ')$';

	  // can match anything, as long as it's not this.
	  if (this.negate) re = '^(?!' + re + ').*$';

	  try {
	    this.regexp = new RegExp(re, flags);
	  } catch (ex) /* istanbul ignore next - should be impossible */ {
	    this.regexp = false;
	  }
	  return this.regexp
	}

	minimatch.match = function (list, pattern, options) {
	  options = options || {};
	  var mm = new Minimatch(pattern, options);
	  list = list.filter(function (f) {
	    return mm.match(f)
	  });
	  if (mm.options.nonull && !list.length) {
	    list.push(pattern);
	  }
	  return list
	};

	Minimatch.prototype.match = function match (f, partial) {
	  if (typeof partial === 'undefined') partial = this.partial;
	  this.debug('match', f, this.pattern);
	  // short-circuit in the case of busted things.
	  // comments, etc.
	  if (this.comment) return false
	  if (this.empty) return f === ''

	  if (f === '/' && partial) return true

	  var options = this.options;

	  // windows: need to use /, not \
	  if (path.sep !== '/') {
	    f = f.split(path.sep).join('/');
	  }

	  // treat the test path as a set of pathparts.
	  f = f.split(slashSplit);
	  this.debug(this.pattern, 'split', f);

	  // just ONE of the pattern sets in this.set needs to match
	  // in order for it to be valid.  If negating, then just one
	  // match means that we have failed.
	  // Either way, return on the first hit.

	  var set = this.set;
	  this.debug(this.pattern, 'set', set);

	  // Find the basename of the path by looking for the last non-empty segment
	  var filename;
	  var i;
	  for (i = f.length - 1; i >= 0; i--) {
	    filename = f[i];
	    if (filename) break
	  }

	  for (i = 0; i < set.length; i++) {
	    var pattern = set[i];
	    var file = f;
	    if (options.matchBase && pattern.length === 1) {
	      file = [filename];
	    }
	    var hit = this.matchOne(file, pattern, partial);
	    if (hit) {
	      if (options.flipNegate) return true
	      return !this.negate
	    }
	  }

	  // didn't get any hits.  this is success if it's a negative
	  // pattern, failure otherwise.
	  if (options.flipNegate) return false
	  return this.negate
	};

	// set partial to true to test if, for example,
	// "/a/b" matches the start of "/*/b/*/d"
	// Partial means, if you run out of file before you run
	// out of pattern, then that's fine, as long as all
	// the parts match.
	Minimatch.prototype.matchOne = function (file, pattern, partial) {
	  var options = this.options;

	  this.debug('matchOne',
	    { 'this': this, file: file, pattern: pattern });

	  this.debug('matchOne', file.length, pattern.length);

	  for (var fi = 0,
	      pi = 0,
	      fl = file.length,
	      pl = pattern.length
	      ; (fi < fl) && (pi < pl)
	      ; fi++, pi++) {
	    this.debug('matchOne loop');
	    var p = pattern[pi];
	    var f = file[fi];

	    this.debug(pattern, p, f);

	    // should be impossible.
	    // some invalid regexp stuff in the set.
	    /* istanbul ignore if */
	    if (p === false) return false

	    if (p === GLOBSTAR) {
	      this.debug('GLOBSTAR', [pattern, p, f]);

	      // "**"
	      // a/**/b/**/c would match the following:
	      // a/b/x/y/z/c
	      // a/x/y/z/b/c
	      // a/b/x/b/x/c
	      // a/b/c
	      // To do this, take the rest of the pattern after
	      // the **, and see if it would match the file remainder.
	      // If so, return success.
	      // If not, the ** "swallows" a segment, and try again.
	      // This is recursively awful.
	      //
	      // a/**/b/**/c matching a/b/x/y/z/c
	      // - a matches a
	      // - doublestar
	      //   - matchOne(b/x/y/z/c, b/**/c)
	      //     - b matches b
	      //     - doublestar
	      //       - matchOne(x/y/z/c, c) -> no
	      //       - matchOne(y/z/c, c) -> no
	      //       - matchOne(z/c, c) -> no
	      //       - matchOne(c, c) yes, hit
	      var fr = fi;
	      var pr = pi + 1;
	      if (pr === pl) {
	        this.debug('** at the end');
	        // a ** at the end will just swallow the rest.
	        // We have found a match.
	        // however, it will not swallow /.x, unless
	        // options.dot is set.
	        // . and .. are *never* matched by **, for explosively
	        // exponential reasons.
	        for (; fi < fl; fi++) {
	          if (file[fi] === '.' || file[fi] === '..' ||
	            (!options.dot && file[fi].charAt(0) === '.')) return false
	        }
	        return true
	      }

	      // ok, let's see if we can swallow whatever we can.
	      while (fr < fl) {
	        var swallowee = file[fr];

	        this.debug('\nglobstar while', file, fr, pattern, pr, swallowee);

	        // XXX remove this slice.  Just pass the start index.
	        if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
	          this.debug('globstar found match!', fr, fl, swallowee);
	          // found a match.
	          return true
	        } else {
	          // can't swallow "." or ".." ever.
	          // can only swallow ".foo" when explicitly asked.
	          if (swallowee === '.' || swallowee === '..' ||
	            (!options.dot && swallowee.charAt(0) === '.')) {
	            this.debug('dot detected!', file, fr, pattern, pr);
	            break
	          }

	          // ** swallows a segment, and continue.
	          this.debug('globstar swallow a segment, and continue');
	          fr++;
	        }
	      }

	      // no match was found.
	      // However, in partial mode, we can't say this is necessarily over.
	      // If there's more *pattern* left, then
	      /* istanbul ignore if */
	      if (partial) {
	        // ran out of file
	        this.debug('\n>>> no match, partial?', file, fr, pattern, pr);
	        if (fr === fl) return true
	      }
	      return false
	    }

	    // something other than **
	    // non-magic patterns just have to match exactly
	    // patterns with magic have been turned into regexps.
	    var hit;
	    if (typeof p === 'string') {
	      hit = f === p;
	      this.debug('string match', p, f, hit);
	    } else {
	      hit = f.match(p);
	      this.debug('pattern match', p, f, hit);
	    }

	    if (!hit) return false
	  }

	  // Note: ending in / means that we'll get a final ""
	  // at the end of the pattern.  This can only match a
	  // corresponding "" at the end of the file.
	  // If the file ends in /, then it can only match a
	  // a pattern that ends in /, unless the pattern just
	  // doesn't have any more for it. But, a/b/ should *not*
	  // match "a/b/*", even though "" matches against the
	  // [^/]*? pattern, except in partial mode, where it might
	  // simply not be reached yet.
	  // However, a/b/ should still satisfy a/*

	  // now either we fell off the end of the pattern, or we're done.
	  if (fi === fl && pi === pl) {
	    // ran out of pattern and filename at the same time.
	    // an exact hit!
	    return true
	  } else if (fi === fl) {
	    // ran out of file, but still had pattern left.
	    // this is ok if we're doing the match as part of
	    // a glob fs traversal.
	    return partial
	  } else /* istanbul ignore else */ if (pi === pl) {
	    // ran out of pattern, still have file left.
	    // this is only acceptable if we're on the very last
	    // empty segment of a file with a trailing slash.
	    // a/* should match a/b/
	    return (fi === fl - 1) && (file[fi] === '')
	  }

	  // should be unreachable.
	  /* istanbul ignore next */
	  throw new Error('wtf?')
	};

	// replace stuff like \* with *
	function globUnescape (s) {
	  return s.replace(/\\(.)/g, '$1')
	}

	function regExpEscape (s) {
	  return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
	}
	return minimatch_1;
}

var pathIsAbsolute = {exports: {}};

var hasRequiredPathIsAbsolute;

function requirePathIsAbsolute () {
	if (hasRequiredPathIsAbsolute) return pathIsAbsolute.exports;
	hasRequiredPathIsAbsolute = 1;

	function posix(path) {
		return path.charAt(0) === '/';
	}

	function win32(path) {
		// https://github.com/nodejs/node/blob/b3fcc245fb25539909ef1d5eaa01dbf92e168633/lib/path.js#L56
		var splitDeviceRe = /^([a-zA-Z]:|[\\\/]{2}[^\\\/]+[\\\/]+[^\\\/]+)?([\\\/])?([\s\S]*?)$/;
		var result = splitDeviceRe.exec(path);
		var device = result[1] || '';
		var isUnc = Boolean(device && device.charAt(1) !== ':');

		// UNC paths are always absolute
		return Boolean(result[2] || isUnc);
	}

	pathIsAbsolute.exports = process.platform === 'win32' ? win32 : posix;
	pathIsAbsolute.exports.posix = posix;
	pathIsAbsolute.exports.win32 = win32;
	return pathIsAbsolute.exports;
}

var common = {};

var hasRequiredCommon;

function requireCommon () {
	if (hasRequiredCommon) return common;
	hasRequiredCommon = 1;
	common.setopts = setopts;
	common.ownProp = ownProp;
	common.makeAbs = makeAbs;
	common.finish = finish;
	common.mark = mark;
	common.isIgnored = isIgnored;
	common.childrenIgnored = childrenIgnored;

	function ownProp (obj, field) {
	  return Object.prototype.hasOwnProperty.call(obj, field)
	}

	var fs = require$$0$3;
	var path = require$$1$1;
	var minimatch = requireMinimatch();
	var isAbsolute = requirePathIsAbsolute();
	var Minimatch = minimatch.Minimatch;

	function alphasort (a, b) {
	  return a.localeCompare(b, 'en')
	}

	function setupIgnores (self, options) {
	  self.ignore = options.ignore || [];

	  if (!Array.isArray(self.ignore))
	    self.ignore = [self.ignore];

	  if (self.ignore.length) {
	    self.ignore = self.ignore.map(ignoreMap);
	  }
	}

	// ignore patterns are always in dot:true mode.
	function ignoreMap (pattern) {
	  var gmatcher = null;
	  if (pattern.slice(-3) === '/**') {
	    var gpattern = pattern.replace(/(\/\*\*)+$/, '');
	    gmatcher = new Minimatch(gpattern, { dot: true });
	  }

	  return {
	    matcher: new Minimatch(pattern, { dot: true }),
	    gmatcher: gmatcher
	  }
	}

	function setopts (self, pattern, options) {
	  if (!options)
	    options = {};

	  // base-matching: just use globstar for that.
	  if (options.matchBase && -1 === pattern.indexOf("/")) {
	    if (options.noglobstar) {
	      throw new Error("base matching requires globstar")
	    }
	    pattern = "**/" + pattern;
	  }

	  self.silent = !!options.silent;
	  self.pattern = pattern;
	  self.strict = options.strict !== false;
	  self.realpath = !!options.realpath;
	  self.realpathCache = options.realpathCache || Object.create(null);
	  self.follow = !!options.follow;
	  self.dot = !!options.dot;
	  self.mark = !!options.mark;
	  self.nodir = !!options.nodir;
	  if (self.nodir)
	    self.mark = true;
	  self.sync = !!options.sync;
	  self.nounique = !!options.nounique;
	  self.nonull = !!options.nonull;
	  self.nosort = !!options.nosort;
	  self.nocase = !!options.nocase;
	  self.stat = !!options.stat;
	  self.noprocess = !!options.noprocess;
	  self.absolute = !!options.absolute;
	  self.fs = options.fs || fs;

	  self.maxLength = options.maxLength || Infinity;
	  self.cache = options.cache || Object.create(null);
	  self.statCache = options.statCache || Object.create(null);
	  self.symlinks = options.symlinks || Object.create(null);

	  setupIgnores(self, options);

	  self.changedCwd = false;
	  var cwd = process.cwd();
	  if (!ownProp(options, "cwd"))
	    self.cwd = cwd;
	  else {
	    self.cwd = path.resolve(options.cwd);
	    self.changedCwd = self.cwd !== cwd;
	  }

	  self.root = options.root || path.resolve(self.cwd, "/");
	  self.root = path.resolve(self.root);
	  if (process.platform === "win32")
	    self.root = self.root.replace(/\\/g, "/");

	  // TODO: is an absolute `cwd` supposed to be resolved against `root`?
	  // e.g. { cwd: '/test', root: __dirname } === path.join(__dirname, '/test')
	  self.cwdAbs = isAbsolute(self.cwd) ? self.cwd : makeAbs(self, self.cwd);
	  if (process.platform === "win32")
	    self.cwdAbs = self.cwdAbs.replace(/\\/g, "/");
	  self.nomount = !!options.nomount;

	  // disable comments and negation in Minimatch.
	  // Note that they are not supported in Glob itself anyway.
	  options.nonegate = true;
	  options.nocomment = true;
	  // always treat \ in patterns as escapes, not path separators
	  options.allowWindowsEscape = false;

	  self.minimatch = new Minimatch(pattern, options);
	  self.options = self.minimatch.options;
	}

	function finish (self) {
	  var nou = self.nounique;
	  var all = nou ? [] : Object.create(null);

	  for (var i = 0, l = self.matches.length; i < l; i ++) {
	    var matches = self.matches[i];
	    if (!matches || Object.keys(matches).length === 0) {
	      if (self.nonull) {
	        // do like the shell, and spit out the literal glob
	        var literal = self.minimatch.globSet[i];
	        if (nou)
	          all.push(literal);
	        else
	          all[literal] = true;
	      }
	    } else {
	      // had matches
	      var m = Object.keys(matches);
	      if (nou)
	        all.push.apply(all, m);
	      else
	        m.forEach(function (m) {
	          all[m] = true;
	        });
	    }
	  }

	  if (!nou)
	    all = Object.keys(all);

	  if (!self.nosort)
	    all = all.sort(alphasort);

	  // at *some* point we statted all of these
	  if (self.mark) {
	    for (var i = 0; i < all.length; i++) {
	      all[i] = self._mark(all[i]);
	    }
	    if (self.nodir) {
	      all = all.filter(function (e) {
	        var notDir = !(/\/$/.test(e));
	        var c = self.cache[e] || self.cache[makeAbs(self, e)];
	        if (notDir && c)
	          notDir = c !== 'DIR' && !Array.isArray(c);
	        return notDir
	      });
	    }
	  }

	  if (self.ignore.length)
	    all = all.filter(function(m) {
	      return !isIgnored(self, m)
	    });

	  self.found = all;
	}

	function mark (self, p) {
	  var abs = makeAbs(self, p);
	  var c = self.cache[abs];
	  var m = p;
	  if (c) {
	    var isDir = c === 'DIR' || Array.isArray(c);
	    var slash = p.slice(-1) === '/';

	    if (isDir && !slash)
	      m += '/';
	    else if (!isDir && slash)
	      m = m.slice(0, -1);

	    if (m !== p) {
	      var mabs = makeAbs(self, m);
	      self.statCache[mabs] = self.statCache[abs];
	      self.cache[mabs] = self.cache[abs];
	    }
	  }

	  return m
	}

	// lotta situps...
	function makeAbs (self, f) {
	  var abs = f;
	  if (f.charAt(0) === '/') {
	    abs = path.join(self.root, f);
	  } else if (isAbsolute(f) || f === '') {
	    abs = f;
	  } else if (self.changedCwd) {
	    abs = path.resolve(self.cwd, f);
	  } else {
	    abs = path.resolve(f);
	  }

	  if (process.platform === 'win32')
	    abs = abs.replace(/\\/g, '/');

	  return abs
	}


	// Return true, if pattern ends with globstar '**', for the accompanying parent directory.
	// Ex:- If node_modules/** is the pattern, add 'node_modules' to ignore list along with it's contents
	function isIgnored (self, path) {
	  if (!self.ignore.length)
	    return false

	  return self.ignore.some(function(item) {
	    return item.matcher.match(path) || !!(item.gmatcher && item.gmatcher.match(path))
	  })
	}

	function childrenIgnored (self, path) {
	  if (!self.ignore.length)
	    return false

	  return self.ignore.some(function(item) {
	    return !!(item.gmatcher && item.gmatcher.match(path))
	  })
	}
	return common;
}

var sync;
var hasRequiredSync;

function requireSync () {
	if (hasRequiredSync) return sync;
	hasRequiredSync = 1;
	sync = globSync;
	globSync.GlobSync = GlobSync;

	var rp = requireFs_realpath();
	var minimatch = requireMinimatch();
	minimatch.Minimatch;
	requireGlob().Glob;
	var path = require$$1$1;
	var assert = require$$5;
	var isAbsolute = requirePathIsAbsolute();
	var common = requireCommon();
	var setopts = common.setopts;
	var ownProp = common.ownProp;
	var childrenIgnored = common.childrenIgnored;
	var isIgnored = common.isIgnored;

	function globSync (pattern, options) {
	  if (typeof options === 'function' || arguments.length === 3)
	    throw new TypeError('callback provided to sync glob\n'+
	                        'See: https://github.com/isaacs/node-glob/issues/167')

	  return new GlobSync(pattern, options).found
	}

	function GlobSync (pattern, options) {
	  if (!pattern)
	    throw new Error('must provide pattern')

	  if (typeof options === 'function' || arguments.length === 3)
	    throw new TypeError('callback provided to sync glob\n'+
	                        'See: https://github.com/isaacs/node-glob/issues/167')

	  if (!(this instanceof GlobSync))
	    return new GlobSync(pattern, options)

	  setopts(this, pattern, options);

	  if (this.noprocess)
	    return this

	  var n = this.minimatch.set.length;
	  this.matches = new Array(n);
	  for (var i = 0; i < n; i ++) {
	    this._process(this.minimatch.set[i], i, false);
	  }
	  this._finish();
	}

	GlobSync.prototype._finish = function () {
	  assert.ok(this instanceof GlobSync);
	  if (this.realpath) {
	    var self = this;
	    this.matches.forEach(function (matchset, index) {
	      var set = self.matches[index] = Object.create(null);
	      for (var p in matchset) {
	        try {
	          p = self._makeAbs(p);
	          var real = rp.realpathSync(p, self.realpathCache);
	          set[real] = true;
	        } catch (er) {
	          if (er.syscall === 'stat')
	            set[self._makeAbs(p)] = true;
	          else
	            throw er
	        }
	      }
	    });
	  }
	  common.finish(this);
	};


	GlobSync.prototype._process = function (pattern, index, inGlobStar) {
	  assert.ok(this instanceof GlobSync);

	  // Get the first [n] parts of pattern that are all strings.
	  var n = 0;
	  while (typeof pattern[n] === 'string') {
	    n ++;
	  }
	  // now n is the index of the first one that is *not* a string.

	  // See if there's anything else
	  var prefix;
	  switch (n) {
	    // if not, then this is rather simple
	    case pattern.length:
	      this._processSimple(pattern.join('/'), index);
	      return

	    case 0:
	      // pattern *starts* with some non-trivial item.
	      // going to readdir(cwd), but not include the prefix in matches.
	      prefix = null;
	      break

	    default:
	      // pattern has some string bits in the front.
	      // whatever it starts with, whether that's 'absolute' like /foo/bar,
	      // or 'relative' like '../baz'
	      prefix = pattern.slice(0, n).join('/');
	      break
	  }

	  var remain = pattern.slice(n);

	  // get the list of entries.
	  var read;
	  if (prefix === null)
	    read = '.';
	  else if (isAbsolute(prefix) ||
	      isAbsolute(pattern.map(function (p) {
	        return typeof p === 'string' ? p : '[*]'
	      }).join('/'))) {
	    if (!prefix || !isAbsolute(prefix))
	      prefix = '/' + prefix;
	    read = prefix;
	  } else
	    read = prefix;

	  var abs = this._makeAbs(read);

	  //if ignored, skip processing
	  if (childrenIgnored(this, read))
	    return

	  var isGlobStar = remain[0] === minimatch.GLOBSTAR;
	  if (isGlobStar)
	    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar);
	  else
	    this._processReaddir(prefix, read, abs, remain, index, inGlobStar);
	};


	GlobSync.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar) {
	  var entries = this._readdir(abs, inGlobStar);

	  // if the abs isn't a dir, then nothing can match!
	  if (!entries)
	    return

	  // It will only match dot entries if it starts with a dot, or if
	  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
	  var pn = remain[0];
	  var negate = !!this.minimatch.negate;
	  var rawGlob = pn._glob;
	  var dotOk = this.dot || rawGlob.charAt(0) === '.';

	  var matchedEntries = [];
	  for (var i = 0; i < entries.length; i++) {
	    var e = entries[i];
	    if (e.charAt(0) !== '.' || dotOk) {
	      var m;
	      if (negate && !prefix) {
	        m = !e.match(pn);
	      } else {
	        m = e.match(pn);
	      }
	      if (m)
	        matchedEntries.push(e);
	    }
	  }

	  var len = matchedEntries.length;
	  // If there are no matched entries, then nothing matches.
	  if (len === 0)
	    return

	  // if this is the last remaining pattern bit, then no need for
	  // an additional stat *unless* the user has specified mark or
	  // stat explicitly.  We know they exist, since readdir returned
	  // them.

	  if (remain.length === 1 && !this.mark && !this.stat) {
	    if (!this.matches[index])
	      this.matches[index] = Object.create(null);

	    for (var i = 0; i < len; i ++) {
	      var e = matchedEntries[i];
	      if (prefix) {
	        if (prefix.slice(-1) !== '/')
	          e = prefix + '/' + e;
	        else
	          e = prefix + e;
	      }

	      if (e.charAt(0) === '/' && !this.nomount) {
	        e = path.join(this.root, e);
	      }
	      this._emitMatch(index, e);
	    }
	    // This was the last one, and no stats were needed
	    return
	  }

	  // now test all matched entries as stand-ins for that part
	  // of the pattern.
	  remain.shift();
	  for (var i = 0; i < len; i ++) {
	    var e = matchedEntries[i];
	    var newPattern;
	    if (prefix)
	      newPattern = [prefix, e];
	    else
	      newPattern = [e];
	    this._process(newPattern.concat(remain), index, inGlobStar);
	  }
	};


	GlobSync.prototype._emitMatch = function (index, e) {
	  if (isIgnored(this, e))
	    return

	  var abs = this._makeAbs(e);

	  if (this.mark)
	    e = this._mark(e);

	  if (this.absolute) {
	    e = abs;
	  }

	  if (this.matches[index][e])
	    return

	  if (this.nodir) {
	    var c = this.cache[abs];
	    if (c === 'DIR' || Array.isArray(c))
	      return
	  }

	  this.matches[index][e] = true;

	  if (this.stat)
	    this._stat(e);
	};


	GlobSync.prototype._readdirInGlobStar = function (abs) {
	  // follow all symlinked directories forever
	  // just proceed as if this is a non-globstar situation
	  if (this.follow)
	    return this._readdir(abs, false)

	  var entries;
	  var lstat;
	  try {
	    lstat = this.fs.lstatSync(abs);
	  } catch (er) {
	    if (er.code === 'ENOENT') {
	      // lstat failed, doesn't exist
	      return null
	    }
	  }

	  var isSym = lstat && lstat.isSymbolicLink();
	  this.symlinks[abs] = isSym;

	  // If it's not a symlink or a dir, then it's definitely a regular file.
	  // don't bother doing a readdir in that case.
	  if (!isSym && lstat && !lstat.isDirectory())
	    this.cache[abs] = 'FILE';
	  else
	    entries = this._readdir(abs, false);

	  return entries
	};

	GlobSync.prototype._readdir = function (abs, inGlobStar) {

	  if (inGlobStar && !ownProp(this.symlinks, abs))
	    return this._readdirInGlobStar(abs)

	  if (ownProp(this.cache, abs)) {
	    var c = this.cache[abs];
	    if (!c || c === 'FILE')
	      return null

	    if (Array.isArray(c))
	      return c
	  }

	  try {
	    return this._readdirEntries(abs, this.fs.readdirSync(abs))
	  } catch (er) {
	    this._readdirError(abs, er);
	    return null
	  }
	};

	GlobSync.prototype._readdirEntries = function (abs, entries) {
	  // if we haven't asked to stat everything, then just
	  // assume that everything in there exists, so we can avoid
	  // having to stat it a second time.
	  if (!this.mark && !this.stat) {
	    for (var i = 0; i < entries.length; i ++) {
	      var e = entries[i];
	      if (abs === '/')
	        e = abs + e;
	      else
	        e = abs + '/' + e;
	      this.cache[e] = true;
	    }
	  }

	  this.cache[abs] = entries;

	  // mark and cache dir-ness
	  return entries
	};

	GlobSync.prototype._readdirError = function (f, er) {
	  // handle errors, and cache the information
	  switch (er.code) {
	    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
	    case 'ENOTDIR': // totally normal. means it *does* exist.
	      var abs = this._makeAbs(f);
	      this.cache[abs] = 'FILE';
	      if (abs === this.cwdAbs) {
	        var error = new Error(er.code + ' invalid cwd ' + this.cwd);
	        error.path = this.cwd;
	        error.code = er.code;
	        throw error
	      }
	      break

	    case 'ENOENT': // not terribly unusual
	    case 'ELOOP':
	    case 'ENAMETOOLONG':
	    case 'UNKNOWN':
	      this.cache[this._makeAbs(f)] = false;
	      break

	    default: // some unusual error.  Treat as failure.
	      this.cache[this._makeAbs(f)] = false;
	      if (this.strict)
	        throw er
	      if (!this.silent)
	        console.error('glob error', er);
	      break
	  }
	};

	GlobSync.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar) {

	  var entries = this._readdir(abs, inGlobStar);

	  // no entries means not a dir, so it can never have matches
	  // foo.txt/** doesn't match foo.txt
	  if (!entries)
	    return

	  // test without the globstar, and with every child both below
	  // and replacing the globstar.
	  var remainWithoutGlobStar = remain.slice(1);
	  var gspref = prefix ? [ prefix ] : [];
	  var noGlobStar = gspref.concat(remainWithoutGlobStar);

	  // the noGlobStar pattern exits the inGlobStar state
	  this._process(noGlobStar, index, false);

	  var len = entries.length;
	  var isSym = this.symlinks[abs];

	  // If it's a symlink, and we're in a globstar, then stop
	  if (isSym && inGlobStar)
	    return

	  for (var i = 0; i < len; i++) {
	    var e = entries[i];
	    if (e.charAt(0) === '.' && !this.dot)
	      continue

	    // these two cases enter the inGlobStar state
	    var instead = gspref.concat(entries[i], remainWithoutGlobStar);
	    this._process(instead, index, true);

	    var below = gspref.concat(entries[i], remain);
	    this._process(below, index, true);
	  }
	};

	GlobSync.prototype._processSimple = function (prefix, index) {
	  // XXX review this.  Shouldn't it be doing the mounting etc
	  // before doing stat?  kinda weird?
	  var exists = this._stat(prefix);

	  if (!this.matches[index])
	    this.matches[index] = Object.create(null);

	  // If it doesn't exist, then just mark the lack of results
	  if (!exists)
	    return

	  if (prefix && isAbsolute(prefix) && !this.nomount) {
	    var trail = /[\/\\]$/.test(prefix);
	    if (prefix.charAt(0) === '/') {
	      prefix = path.join(this.root, prefix);
	    } else {
	      prefix = path.resolve(this.root, prefix);
	      if (trail)
	        prefix += '/';
	    }
	  }

	  if (process.platform === 'win32')
	    prefix = prefix.replace(/\\/g, '/');

	  // Mark this as a match
	  this._emitMatch(index, prefix);
	};

	// Returns either 'DIR', 'FILE', or false
	GlobSync.prototype._stat = function (f) {
	  var abs = this._makeAbs(f);
	  var needDir = f.slice(-1) === '/';

	  if (f.length > this.maxLength)
	    return false

	  if (!this.stat && ownProp(this.cache, abs)) {
	    var c = this.cache[abs];

	    if (Array.isArray(c))
	      c = 'DIR';

	    // It exists, but maybe not how we need it
	    if (!needDir || c === 'DIR')
	      return c

	    if (needDir && c === 'FILE')
	      return false

	    // otherwise we have to stat, because maybe c=true
	    // if we know it exists, but not what it is.
	  }
	  var stat = this.statCache[abs];
	  if (!stat) {
	    var lstat;
	    try {
	      lstat = this.fs.lstatSync(abs);
	    } catch (er) {
	      if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
	        this.statCache[abs] = false;
	        return false
	      }
	    }

	    if (lstat && lstat.isSymbolicLink()) {
	      try {
	        stat = this.fs.statSync(abs);
	      } catch (er) {
	        stat = lstat;
	      }
	    } else {
	      stat = lstat;
	    }
	  }

	  this.statCache[abs] = stat;

	  var c = true;
	  if (stat)
	    c = stat.isDirectory() ? 'DIR' : 'FILE';

	  this.cache[abs] = this.cache[abs] || c;

	  if (needDir && c === 'FILE')
	    return false

	  return c
	};

	GlobSync.prototype._mark = function (p) {
	  return common.mark(this, p)
	};

	GlobSync.prototype._makeAbs = function (f) {
	  return common.makeAbs(this, f)
	};
	return sync;
}

var inflight_1;
var hasRequiredInflight;

function requireInflight () {
	if (hasRequiredInflight) return inflight_1;
	hasRequiredInflight = 1;
	var wrappy = requireWrappy();
	var reqs = Object.create(null);
	var once = requireOnce();

	inflight_1 = wrappy(inflight);

	function inflight (key, cb) {
	  if (reqs[key]) {
	    reqs[key].push(cb);
	    return null
	  } else {
	    reqs[key] = [cb];
	    return makeres(key)
	  }
	}

	function makeres (key) {
	  return once(function RES () {
	    var cbs = reqs[key];
	    var len = cbs.length;
	    var args = slice(arguments);

	    // XXX It's somewhat ambiguous whether a new callback added in this
	    // pass should be queued for later execution if something in the
	    // list of callbacks throws, or if it should just be discarded.
	    // However, it's such an edge case that it hardly matters, and either
	    // choice is likely as surprising as the other.
	    // As it happens, we do go ahead and schedule it for later execution.
	    try {
	      for (var i = 0; i < len; i++) {
	        cbs[i].apply(null, args);
	      }
	    } finally {
	      if (cbs.length > len) {
	        // added more in the interim.
	        // de-zalgo, just in case, but don't call again.
	        cbs.splice(0, len);
	        process.nextTick(function () {
	          RES.apply(null, args);
	        });
	      } else {
	        delete reqs[key];
	      }
	    }
	  })
	}

	function slice (args) {
	  var length = args.length;
	  var array = [];

	  for (var i = 0; i < length; i++) array[i] = args[i];
	  return array
	}
	return inflight_1;
}

var glob_1;
var hasRequiredGlob;

function requireGlob () {
	if (hasRequiredGlob) return glob_1;
	hasRequiredGlob = 1;
	// Approach:
	//
	// 1. Get the minimatch set
	// 2. For each pattern in the set, PROCESS(pattern, false)
	// 3. Store matches per-set, then uniq them
	//
	// PROCESS(pattern, inGlobStar)
	// Get the first [n] items from pattern that are all strings
	// Join these together.  This is PREFIX.
	//   If there is no more remaining, then stat(PREFIX) and
	//   add to matches if it succeeds.  END.
	//
	// If inGlobStar and PREFIX is symlink and points to dir
	//   set ENTRIES = []
	// else readdir(PREFIX) as ENTRIES
	//   If fail, END
	//
	// with ENTRIES
	//   If pattern[n] is GLOBSTAR
	//     // handle the case where the globstar match is empty
	//     // by pruning it out, and testing the resulting pattern
	//     PROCESS(pattern[0..n] + pattern[n+1 .. $], false)
	//     // handle other cases.
	//     for ENTRY in ENTRIES (not dotfiles)
	//       // attach globstar + tail onto the entry
	//       // Mark that this entry is a globstar match
	//       PROCESS(pattern[0..n] + ENTRY + pattern[n .. $], true)
	//
	//   else // not globstar
	//     for ENTRY in ENTRIES (not dotfiles, unless pattern[n] is dot)
	//       Test ENTRY against pattern[n]
	//       If fails, continue
	//       If passes, PROCESS(pattern[0..n] + item + pattern[n+1 .. $])
	//
	// Caveat:
	//   Cache all stats and readdirs results to minimize syscall.  Since all
	//   we ever care about is existence and directory-ness, we can just keep
	//   `true` for files, and [children,...] for directories, or `false` for
	//   things that don't exist.

	glob_1 = glob;

	var rp = requireFs_realpath();
	var minimatch = requireMinimatch();
	minimatch.Minimatch;
	var inherits = requireInherits();
	var EE = require$$4.EventEmitter;
	var path = require$$1$1;
	var assert = require$$5;
	var isAbsolute = requirePathIsAbsolute();
	var globSync = requireSync();
	var common = requireCommon();
	var setopts = common.setopts;
	var ownProp = common.ownProp;
	var inflight = requireInflight();
	var childrenIgnored = common.childrenIgnored;
	var isIgnored = common.isIgnored;

	var once = requireOnce();

	function glob (pattern, options, cb) {
	  if (typeof options === 'function') cb = options, options = {};
	  if (!options) options = {};

	  if (options.sync) {
	    if (cb)
	      throw new TypeError('callback provided to sync glob')
	    return globSync(pattern, options)
	  }

	  return new Glob(pattern, options, cb)
	}

	glob.sync = globSync;
	var GlobSync = glob.GlobSync = globSync.GlobSync;

	// old api surface
	glob.glob = glob;

	function extend (origin, add) {
	  if (add === null || typeof add !== 'object') {
	    return origin
	  }

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin
	}

	glob.hasMagic = function (pattern, options_) {
	  var options = extend({}, options_);
	  options.noprocess = true;

	  var g = new Glob(pattern, options);
	  var set = g.minimatch.set;

	  if (!pattern)
	    return false

	  if (set.length > 1)
	    return true

	  for (var j = 0; j < set[0].length; j++) {
	    if (typeof set[0][j] !== 'string')
	      return true
	  }

	  return false
	};

	glob.Glob = Glob;
	inherits(Glob, EE);
	function Glob (pattern, options, cb) {
	  if (typeof options === 'function') {
	    cb = options;
	    options = null;
	  }

	  if (options && options.sync) {
	    if (cb)
	      throw new TypeError('callback provided to sync glob')
	    return new GlobSync(pattern, options)
	  }

	  if (!(this instanceof Glob))
	    return new Glob(pattern, options, cb)

	  setopts(this, pattern, options);
	  this._didRealPath = false;

	  // process each pattern in the minimatch set
	  var n = this.minimatch.set.length;

	  // The matches are stored as {<filename>: true,...} so that
	  // duplicates are automagically pruned.
	  // Later, we do an Object.keys() on these.
	  // Keep them as a list so we can fill in when nonull is set.
	  this.matches = new Array(n);

	  if (typeof cb === 'function') {
	    cb = once(cb);
	    this.on('error', cb);
	    this.on('end', function (matches) {
	      cb(null, matches);
	    });
	  }

	  var self = this;
	  this._processing = 0;

	  this._emitQueue = [];
	  this._processQueue = [];
	  this.paused = false;

	  if (this.noprocess)
	    return this

	  if (n === 0)
	    return done()

	  var sync = true;
	  for (var i = 0; i < n; i ++) {
	    this._process(this.minimatch.set[i], i, false, done);
	  }
	  sync = false;

	  function done () {
	    --self._processing;
	    if (self._processing <= 0) {
	      if (sync) {
	        process.nextTick(function () {
	          self._finish();
	        });
	      } else {
	        self._finish();
	      }
	    }
	  }
	}

	Glob.prototype._finish = function () {
	  assert(this instanceof Glob);
	  if (this.aborted)
	    return

	  if (this.realpath && !this._didRealpath)
	    return this._realpath()

	  common.finish(this);
	  this.emit('end', this.found);
	};

	Glob.prototype._realpath = function () {
	  if (this._didRealpath)
	    return

	  this._didRealpath = true;

	  var n = this.matches.length;
	  if (n === 0)
	    return this._finish()

	  var self = this;
	  for (var i = 0; i < this.matches.length; i++)
	    this._realpathSet(i, next);

	  function next () {
	    if (--n === 0)
	      self._finish();
	  }
	};

	Glob.prototype._realpathSet = function (index, cb) {
	  var matchset = this.matches[index];
	  if (!matchset)
	    return cb()

	  var found = Object.keys(matchset);
	  var self = this;
	  var n = found.length;

	  if (n === 0)
	    return cb()

	  var set = this.matches[index] = Object.create(null);
	  found.forEach(function (p, i) {
	    // If there's a problem with the stat, then it means that
	    // one or more of the links in the realpath couldn't be
	    // resolved.  just return the abs value in that case.
	    p = self._makeAbs(p);
	    rp.realpath(p, self.realpathCache, function (er, real) {
	      if (!er)
	        set[real] = true;
	      else if (er.syscall === 'stat')
	        set[p] = true;
	      else
	        self.emit('error', er); // srsly wtf right here

	      if (--n === 0) {
	        self.matches[index] = set;
	        cb();
	      }
	    });
	  });
	};

	Glob.prototype._mark = function (p) {
	  return common.mark(this, p)
	};

	Glob.prototype._makeAbs = function (f) {
	  return common.makeAbs(this, f)
	};

	Glob.prototype.abort = function () {
	  this.aborted = true;
	  this.emit('abort');
	};

	Glob.prototype.pause = function () {
	  if (!this.paused) {
	    this.paused = true;
	    this.emit('pause');
	  }
	};

	Glob.prototype.resume = function () {
	  if (this.paused) {
	    this.emit('resume');
	    this.paused = false;
	    if (this._emitQueue.length) {
	      var eq = this._emitQueue.slice(0);
	      this._emitQueue.length = 0;
	      for (var i = 0; i < eq.length; i ++) {
	        var e = eq[i];
	        this._emitMatch(e[0], e[1]);
	      }
	    }
	    if (this._processQueue.length) {
	      var pq = this._processQueue.slice(0);
	      this._processQueue.length = 0;
	      for (var i = 0; i < pq.length; i ++) {
	        var p = pq[i];
	        this._processing--;
	        this._process(p[0], p[1], p[2], p[3]);
	      }
	    }
	  }
	};

	Glob.prototype._process = function (pattern, index, inGlobStar, cb) {
	  assert(this instanceof Glob);
	  assert(typeof cb === 'function');

	  if (this.aborted)
	    return

	  this._processing++;
	  if (this.paused) {
	    this._processQueue.push([pattern, index, inGlobStar, cb]);
	    return
	  }

	  //console.error('PROCESS %d', this._processing, pattern)

	  // Get the first [n] parts of pattern that are all strings.
	  var n = 0;
	  while (typeof pattern[n] === 'string') {
	    n ++;
	  }
	  // now n is the index of the first one that is *not* a string.

	  // see if there's anything else
	  var prefix;
	  switch (n) {
	    // if not, then this is rather simple
	    case pattern.length:
	      this._processSimple(pattern.join('/'), index, cb);
	      return

	    case 0:
	      // pattern *starts* with some non-trivial item.
	      // going to readdir(cwd), but not include the prefix in matches.
	      prefix = null;
	      break

	    default:
	      // pattern has some string bits in the front.
	      // whatever it starts with, whether that's 'absolute' like /foo/bar,
	      // or 'relative' like '../baz'
	      prefix = pattern.slice(0, n).join('/');
	      break
	  }

	  var remain = pattern.slice(n);

	  // get the list of entries.
	  var read;
	  if (prefix === null)
	    read = '.';
	  else if (isAbsolute(prefix) ||
	      isAbsolute(pattern.map(function (p) {
	        return typeof p === 'string' ? p : '[*]'
	      }).join('/'))) {
	    if (!prefix || !isAbsolute(prefix))
	      prefix = '/' + prefix;
	    read = prefix;
	  } else
	    read = prefix;

	  var abs = this._makeAbs(read);

	  //if ignored, skip _processing
	  if (childrenIgnored(this, read))
	    return cb()

	  var isGlobStar = remain[0] === minimatch.GLOBSTAR;
	  if (isGlobStar)
	    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
	  else
	    this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
	};

	Glob.prototype._processReaddir = function (prefix, read, abs, remain, index, inGlobStar, cb) {
	  var self = this;
	  this._readdir(abs, inGlobStar, function (er, entries) {
	    return self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb)
	  });
	};

	Glob.prototype._processReaddir2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {

	  // if the abs isn't a dir, then nothing can match!
	  if (!entries)
	    return cb()

	  // It will only match dot entries if it starts with a dot, or if
	  // dot is set.  Stuff like @(.foo|.bar) isn't allowed.
	  var pn = remain[0];
	  var negate = !!this.minimatch.negate;
	  var rawGlob = pn._glob;
	  var dotOk = this.dot || rawGlob.charAt(0) === '.';

	  var matchedEntries = [];
	  for (var i = 0; i < entries.length; i++) {
	    var e = entries[i];
	    if (e.charAt(0) !== '.' || dotOk) {
	      var m;
	      if (negate && !prefix) {
	        m = !e.match(pn);
	      } else {
	        m = e.match(pn);
	      }
	      if (m)
	        matchedEntries.push(e);
	    }
	  }

	  //console.error('prd2', prefix, entries, remain[0]._glob, matchedEntries)

	  var len = matchedEntries.length;
	  // If there are no matched entries, then nothing matches.
	  if (len === 0)
	    return cb()

	  // if this is the last remaining pattern bit, then no need for
	  // an additional stat *unless* the user has specified mark or
	  // stat explicitly.  We know they exist, since readdir returned
	  // them.

	  if (remain.length === 1 && !this.mark && !this.stat) {
	    if (!this.matches[index])
	      this.matches[index] = Object.create(null);

	    for (var i = 0; i < len; i ++) {
	      var e = matchedEntries[i];
	      if (prefix) {
	        if (prefix !== '/')
	          e = prefix + '/' + e;
	        else
	          e = prefix + e;
	      }

	      if (e.charAt(0) === '/' && !this.nomount) {
	        e = path.join(this.root, e);
	      }
	      this._emitMatch(index, e);
	    }
	    // This was the last one, and no stats were needed
	    return cb()
	  }

	  // now test all matched entries as stand-ins for that part
	  // of the pattern.
	  remain.shift();
	  for (var i = 0; i < len; i ++) {
	    var e = matchedEntries[i];
	    if (prefix) {
	      if (prefix !== '/')
	        e = prefix + '/' + e;
	      else
	        e = prefix + e;
	    }
	    this._process([e].concat(remain), index, inGlobStar, cb);
	  }
	  cb();
	};

	Glob.prototype._emitMatch = function (index, e) {
	  if (this.aborted)
	    return

	  if (isIgnored(this, e))
	    return

	  if (this.paused) {
	    this._emitQueue.push([index, e]);
	    return
	  }

	  var abs = isAbsolute(e) ? e : this._makeAbs(e);

	  if (this.mark)
	    e = this._mark(e);

	  if (this.absolute)
	    e = abs;

	  if (this.matches[index][e])
	    return

	  if (this.nodir) {
	    var c = this.cache[abs];
	    if (c === 'DIR' || Array.isArray(c))
	      return
	  }

	  this.matches[index][e] = true;

	  var st = this.statCache[abs];
	  if (st)
	    this.emit('stat', e, st);

	  this.emit('match', e);
	};

	Glob.prototype._readdirInGlobStar = function (abs, cb) {
	  if (this.aborted)
	    return

	  // follow all symlinked directories forever
	  // just proceed as if this is a non-globstar situation
	  if (this.follow)
	    return this._readdir(abs, false, cb)

	  var lstatkey = 'lstat\0' + abs;
	  var self = this;
	  var lstatcb = inflight(lstatkey, lstatcb_);

	  if (lstatcb)
	    self.fs.lstat(abs, lstatcb);

	  function lstatcb_ (er, lstat) {
	    if (er && er.code === 'ENOENT')
	      return cb()

	    var isSym = lstat && lstat.isSymbolicLink();
	    self.symlinks[abs] = isSym;

	    // If it's not a symlink or a dir, then it's definitely a regular file.
	    // don't bother doing a readdir in that case.
	    if (!isSym && lstat && !lstat.isDirectory()) {
	      self.cache[abs] = 'FILE';
	      cb();
	    } else
	      self._readdir(abs, false, cb);
	  }
	};

	Glob.prototype._readdir = function (abs, inGlobStar, cb) {
	  if (this.aborted)
	    return

	  cb = inflight('readdir\0'+abs+'\0'+inGlobStar, cb);
	  if (!cb)
	    return

	  //console.error('RD %j %j', +inGlobStar, abs)
	  if (inGlobStar && !ownProp(this.symlinks, abs))
	    return this._readdirInGlobStar(abs, cb)

	  if (ownProp(this.cache, abs)) {
	    var c = this.cache[abs];
	    if (!c || c === 'FILE')
	      return cb()

	    if (Array.isArray(c))
	      return cb(null, c)
	  }

	  var self = this;
	  self.fs.readdir(abs, readdirCb(this, abs, cb));
	};

	function readdirCb (self, abs, cb) {
	  return function (er, entries) {
	    if (er)
	      self._readdirError(abs, er, cb);
	    else
	      self._readdirEntries(abs, entries, cb);
	  }
	}

	Glob.prototype._readdirEntries = function (abs, entries, cb) {
	  if (this.aborted)
	    return

	  // if we haven't asked to stat everything, then just
	  // assume that everything in there exists, so we can avoid
	  // having to stat it a second time.
	  if (!this.mark && !this.stat) {
	    for (var i = 0; i < entries.length; i ++) {
	      var e = entries[i];
	      if (abs === '/')
	        e = abs + e;
	      else
	        e = abs + '/' + e;
	      this.cache[e] = true;
	    }
	  }

	  this.cache[abs] = entries;
	  return cb(null, entries)
	};

	Glob.prototype._readdirError = function (f, er, cb) {
	  if (this.aborted)
	    return

	  // handle errors, and cache the information
	  switch (er.code) {
	    case 'ENOTSUP': // https://github.com/isaacs/node-glob/issues/205
	    case 'ENOTDIR': // totally normal. means it *does* exist.
	      var abs = this._makeAbs(f);
	      this.cache[abs] = 'FILE';
	      if (abs === this.cwdAbs) {
	        var error = new Error(er.code + ' invalid cwd ' + this.cwd);
	        error.path = this.cwd;
	        error.code = er.code;
	        this.emit('error', error);
	        this.abort();
	      }
	      break

	    case 'ENOENT': // not terribly unusual
	    case 'ELOOP':
	    case 'ENAMETOOLONG':
	    case 'UNKNOWN':
	      this.cache[this._makeAbs(f)] = false;
	      break

	    default: // some unusual error.  Treat as failure.
	      this.cache[this._makeAbs(f)] = false;
	      if (this.strict) {
	        this.emit('error', er);
	        // If the error is handled, then we abort
	        // if not, we threw out of here
	        this.abort();
	      }
	      if (!this.silent)
	        console.error('glob error', er);
	      break
	  }

	  return cb()
	};

	Glob.prototype._processGlobStar = function (prefix, read, abs, remain, index, inGlobStar, cb) {
	  var self = this;
	  this._readdir(abs, inGlobStar, function (er, entries) {
	    self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
	  });
	};


	Glob.prototype._processGlobStar2 = function (prefix, read, abs, remain, index, inGlobStar, entries, cb) {
	  //console.error('pgs2', prefix, remain[0], entries)

	  // no entries means not a dir, so it can never have matches
	  // foo.txt/** doesn't match foo.txt
	  if (!entries)
	    return cb()

	  // test without the globstar, and with every child both below
	  // and replacing the globstar.
	  var remainWithoutGlobStar = remain.slice(1);
	  var gspref = prefix ? [ prefix ] : [];
	  var noGlobStar = gspref.concat(remainWithoutGlobStar);

	  // the noGlobStar pattern exits the inGlobStar state
	  this._process(noGlobStar, index, false, cb);

	  var isSym = this.symlinks[abs];
	  var len = entries.length;

	  // If it's a symlink, and we're in a globstar, then stop
	  if (isSym && inGlobStar)
	    return cb()

	  for (var i = 0; i < len; i++) {
	    var e = entries[i];
	    if (e.charAt(0) === '.' && !this.dot)
	      continue

	    // these two cases enter the inGlobStar state
	    var instead = gspref.concat(entries[i], remainWithoutGlobStar);
	    this._process(instead, index, true, cb);

	    var below = gspref.concat(entries[i], remain);
	    this._process(below, index, true, cb);
	  }

	  cb();
	};

	Glob.prototype._processSimple = function (prefix, index, cb) {
	  // XXX review this.  Shouldn't it be doing the mounting etc
	  // before doing stat?  kinda weird?
	  var self = this;
	  this._stat(prefix, function (er, exists) {
	    self._processSimple2(prefix, index, er, exists, cb);
	  });
	};
	Glob.prototype._processSimple2 = function (prefix, index, er, exists, cb) {

	  //console.error('ps2', prefix, exists)

	  if (!this.matches[index])
	    this.matches[index] = Object.create(null);

	  // If it doesn't exist, then just mark the lack of results
	  if (!exists)
	    return cb()

	  if (prefix && isAbsolute(prefix) && !this.nomount) {
	    var trail = /[\/\\]$/.test(prefix);
	    if (prefix.charAt(0) === '/') {
	      prefix = path.join(this.root, prefix);
	    } else {
	      prefix = path.resolve(this.root, prefix);
	      if (trail)
	        prefix += '/';
	    }
	  }

	  if (process.platform === 'win32')
	    prefix = prefix.replace(/\\/g, '/');

	  // Mark this as a match
	  this._emitMatch(index, prefix);
	  cb();
	};

	// Returns either 'DIR', 'FILE', or false
	Glob.prototype._stat = function (f, cb) {
	  var abs = this._makeAbs(f);
	  var needDir = f.slice(-1) === '/';

	  if (f.length > this.maxLength)
	    return cb()

	  if (!this.stat && ownProp(this.cache, abs)) {
	    var c = this.cache[abs];

	    if (Array.isArray(c))
	      c = 'DIR';

	    // It exists, but maybe not how we need it
	    if (!needDir || c === 'DIR')
	      return cb(null, c)

	    if (needDir && c === 'FILE')
	      return cb()

	    // otherwise we have to stat, because maybe c=true
	    // if we know it exists, but not what it is.
	  }
	  var stat = this.statCache[abs];
	  if (stat !== undefined) {
	    if (stat === false)
	      return cb(null, stat)
	    else {
	      var type = stat.isDirectory() ? 'DIR' : 'FILE';
	      if (needDir && type === 'FILE')
	        return cb()
	      else
	        return cb(null, type, stat)
	    }
	  }

	  var self = this;
	  var statcb = inflight('stat\0' + abs, lstatcb_);
	  if (statcb)
	    self.fs.lstat(abs, statcb);

	  function lstatcb_ (er, lstat) {
	    if (lstat && lstat.isSymbolicLink()) {
	      // If it's a symlink, then treat it as the target, unless
	      // the target does not exist, then treat it as a file.
	      return self.fs.stat(abs, function (er, stat) {
	        if (er)
	          self._stat2(f, abs, null, lstat, cb);
	        else
	          self._stat2(f, abs, er, stat, cb);
	      })
	    } else {
	      self._stat2(f, abs, er, lstat, cb);
	    }
	  }
	};

	Glob.prototype._stat2 = function (f, abs, er, stat, cb) {
	  if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
	    this.statCache[abs] = false;
	    return cb()
	  }

	  var needDir = f.slice(-1) === '/';
	  this.statCache[abs] = stat;

	  if (abs.slice(-1) === '/' && stat && !stat.isDirectory())
	    return cb(null, false, stat)

	  var c = true;
	  if (stat)
	    c = stat.isDirectory() ? 'DIR' : 'FILE';
	  this.cache[abs] = this.cache[abs] || c;

	  if (needDir && c === 'FILE')
	    return cb()

	  return cb(null, c, stat)
	};
	return glob_1;
}

const assert = require$$5;
const path = require$$1$1;
const fs = require$$0$3;
let glob = undefined;
try {
  glob = requireGlob();
} catch (_err) {
  // treat glob as optional.
}

const defaultGlobOpts = {
  nosort: true,
  silent: true
};

// for EMFILE handling
let timeout = 0;

const isWindows = (process.platform === "win32");

const defaults = options => {
  const methods = [
    'unlink',
    'chmod',
    'stat',
    'lstat',
    'rmdir',
    'readdir'
  ];
  methods.forEach(m => {
    options[m] = options[m] || fs[m];
    m = m + 'Sync';
    options[m] = options[m] || fs[m];
  });

  options.maxBusyTries = options.maxBusyTries || 3;
  options.emfileWait = options.emfileWait || 1000;
  if (options.glob === false) {
    options.disableGlob = true;
  }
  if (options.disableGlob !== true && glob === undefined) {
    throw Error('glob dependency not found, set `options.disableGlob = true` if intentional')
  }
  options.disableGlob = options.disableGlob || false;
  options.glob = options.glob || defaultGlobOpts;
};

const rimraf = (p, options, cb) => {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }

  assert(p, 'rimraf: missing path');
  assert.equal(typeof p, 'string', 'rimraf: path should be a string');
  assert.equal(typeof cb, 'function', 'rimraf: callback function required');
  assert(options, 'rimraf: invalid options argument provided');
  assert.equal(typeof options, 'object', 'rimraf: options should be object');

  defaults(options);

  let busyTries = 0;
  let errState = null;
  let n = 0;

  const next = (er) => {
    errState = errState || er;
    if (--n === 0)
      cb(errState);
  };

  const afterGlob = (er, results) => {
    if (er)
      return cb(er)

    n = results.length;
    if (n === 0)
      return cb()

    results.forEach(p => {
      const CB = (er) => {
        if (er) {
          if ((er.code === "EBUSY" || er.code === "ENOTEMPTY" || er.code === "EPERM") &&
              busyTries < options.maxBusyTries) {
            busyTries ++;
            // try again, with the same exact callback as this one.
            return setTimeout(() => rimraf_(p, options, CB), busyTries * 100)
          }

          // this one won't happen if graceful-fs is used.
          if (er.code === "EMFILE" && timeout < options.emfileWait) {
            return setTimeout(() => rimraf_(p, options, CB), timeout ++)
          }

          // already gone
          if (er.code === "ENOENT") er = null;
        }

        timeout = 0;
        next(er);
      };
      rimraf_(p, options, CB);
    });
  };

  if (options.disableGlob || !glob.hasMagic(p))
    return afterGlob(null, [p])

  options.lstat(p, (er, stat) => {
    if (!er)
      return afterGlob(null, [p])

    glob(p, options.glob, afterGlob);
  });

};

// Two possible strategies.
// 1. Assume it's a file.  unlink it, then do the dir stuff on EPERM or EISDIR
// 2. Assume it's a directory.  readdir, then do the file stuff on ENOTDIR
//
// Both result in an extra syscall when you guess wrong.  However, there
// are likely far more normal files in the world than directories.  This
// is based on the assumption that a the average number of files per
// directory is >= 1.
//
// If anyone ever complains about this, then I guess the strategy could
// be made configurable somehow.  But until then, YAGNI.
const rimraf_ = (p, options, cb) => {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  // sunos lets the root user unlink directories, which is... weird.
  // so we have to lstat here and make sure it's not a dir.
  options.lstat(p, (er, st) => {
    if (er && er.code === "ENOENT")
      return cb(null)

    // Windows can EPERM on stat.  Life is suffering.
    if (er && er.code === "EPERM" && isWindows)
      fixWinEPERM(p, options, er, cb);

    if (st && st.isDirectory())
      return rmdir(p, options, er, cb)

    options.unlink(p, er => {
      if (er) {
        if (er.code === "ENOENT")
          return cb(null)
        if (er.code === "EPERM")
          return (isWindows)
            ? fixWinEPERM(p, options, er, cb)
            : rmdir(p, options, er, cb)
        if (er.code === "EISDIR")
          return rmdir(p, options, er, cb)
      }
      return cb(er)
    });
  });
};

const fixWinEPERM = (p, options, er, cb) => {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  options.chmod(p, 0o666, er2 => {
    if (er2)
      cb(er2.code === "ENOENT" ? null : er);
    else
      options.stat(p, (er3, stats) => {
        if (er3)
          cb(er3.code === "ENOENT" ? null : er);
        else if (stats.isDirectory())
          rmdir(p, options, er, cb);
        else
          options.unlink(p, cb);
      });
  });
};

const fixWinEPERMSync = (p, options, er) => {
  assert(p);
  assert(options);

  try {
    options.chmodSync(p, 0o666);
  } catch (er2) {
    if (er2.code === "ENOENT")
      return
    else
      throw er
  }

  let stats;
  try {
    stats = options.statSync(p);
  } catch (er3) {
    if (er3.code === "ENOENT")
      return
    else
      throw er
  }

  if (stats.isDirectory())
    rmdirSync(p, options, er);
  else
    options.unlinkSync(p);
};

const rmdir = (p, options, originalEr, cb) => {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  // try to rmdir first, and only readdir on ENOTEMPTY or EEXIST (SunOS)
  // if we guessed wrong, and it's not a directory, then
  // raise the original error.
  options.rmdir(p, er => {
    if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM"))
      rmkids(p, options, cb);
    else if (er && er.code === "ENOTDIR")
      cb(originalEr);
    else
      cb(er);
  });
};

const rmkids = (p, options, cb) => {
  assert(p);
  assert(options);
  assert(typeof cb === 'function');

  options.readdir(p, (er, files) => {
    if (er)
      return cb(er)
    let n = files.length;
    if (n === 0)
      return options.rmdir(p, cb)
    let errState;
    files.forEach(f => {
      rimraf(path.join(p, f), options, er => {
        if (errState)
          return
        if (er)
          return cb(errState = er)
        if (--n === 0)
          options.rmdir(p, cb);
      });
    });
  });
};

// this looks simpler, and is strictly *faster*, but will
// tie up the JavaScript thread and fail on excessively
// deep directory trees.
const rimrafSync = (p, options) => {
  options = options || {};
  defaults(options);

  assert(p, 'rimraf: missing path');
  assert.equal(typeof p, 'string', 'rimraf: path should be a string');
  assert(options, 'rimraf: missing options');
  assert.equal(typeof options, 'object', 'rimraf: options should be object');

  let results;

  if (options.disableGlob || !glob.hasMagic(p)) {
    results = [p];
  } else {
    try {
      options.lstatSync(p);
      results = [p];
    } catch (er) {
      results = glob.sync(p, options.glob);
    }
  }

  if (!results.length)
    return

  for (let i = 0; i < results.length; i++) {
    const p = results[i];

    let st;
    try {
      st = options.lstatSync(p);
    } catch (er) {
      if (er.code === "ENOENT")
        return

      // Windows can EPERM on stat.  Life is suffering.
      if (er.code === "EPERM" && isWindows)
        fixWinEPERMSync(p, options, er);
    }

    try {
      // sunos lets the root user unlink directories, which is... weird.
      if (st && st.isDirectory())
        rmdirSync(p, options, null);
      else
        options.unlinkSync(p);
    } catch (er) {
      if (er.code === "ENOENT")
        return
      if (er.code === "EPERM")
        return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er)
      if (er.code !== "EISDIR")
        throw er

      rmdirSync(p, options, er);
    }
  }
};

const rmdirSync = (p, options, originalEr) => {
  assert(p);
  assert(options);

  try {
    options.rmdirSync(p);
  } catch (er) {
    if (er.code === "ENOENT")
      return
    if (er.code === "ENOTDIR")
      throw originalEr
    if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")
      rmkidsSync(p, options);
  }
};

const rmkidsSync = (p, options) => {
  assert(p);
  assert(options);
  options.readdirSync(p).forEach(f => rimrafSync(path.join(p, f), options));

  // We only end up here once we got ENOTEMPTY at least once, and
  // at this point, we are guaranteed to have removed all the kids.
  // So, we know that it won't be ENOENT or ENOTDIR or anything else.
  // try really hard to delete stuff on windows, because it has a
  // PROFOUNDLY annoying habit of not closing handles promptly when
  // files are deleted, resulting in spurious ENOTEMPTY errors.
  const retries = isWindows ? 100 : 1;
  let i = 0;
  do {
    let threw = true;
    try {
      const ret = options.rmdirSync(p, options);
      threw = false;
      return ret
    } finally {
      if (++i < retries && threw)
        continue
    }
  } while (true)
};

var rimraf_1 = rimraf;
rimraf.sync = rimrafSync;

var downloadUrl = download$2;
var gitclone = gitClone;
var rm = rimraf_1.sync;

/**
 * Expose `download`.
 */

var downloadGitRepo = download;

/**
 * Download `repo` to `dest` and callback `fn(err)`.
 *
 * @param {String} repo
 * @param {String} dest
 * @param {Object} opts
 * @param {Function} fn
 */

function download (repo, dest, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts;
    opts = null;
  }
  opts = opts || {};
  var clone = opts.clone || false;
  delete opts.clone;

  repo = normalize(repo);
  var url = repo.url || getUrl(repo, clone);

  if (clone) {
    var cloneOptions = {
      checkout: repo.checkout,
      shallow: repo.checkout === 'master',
      ...opts
    };
    gitclone(url, dest, cloneOptions, function (err) {
      if (err === undefined) {
        rm(dest + '/.git');
        fn();
      } else {
        fn(err);
      }
    });
  } else {
    var downloadOptions = {
      extract: true,
      strip: 1,
      mode: '666',
      ...opts,
      headers: {
        accept: 'application/zip',
        ...(opts.headers || {})
      }
    };
    downloadUrl(url, dest, downloadOptions)
      .then(function (data) {
        fn();
      })
      .catch(function (err) {
        fn(err);
      });
  }
}

/**
 * Normalize a repo string.
 *
 * @param {String} repo
 * @return {Object}
 */

function normalize (repo) {
  var regex = /^(?:(direct):([^#]+)(?:#(.+))?)$/;
  var match = regex.exec(repo);

  if (match) {
    var url = match[2];
    var directCheckout = match[3] || 'master';

    return {
      type: 'direct',
      url: url,
      checkout: directCheckout
    }
  } else {
    regex = /^(?:(github|gitlab|bitbucket):)?(?:(.+):)?([^/]+)\/([^#]+)(?:#(.+))?$/;
    match = regex.exec(repo);
    var type = match[1] || 'github';
    var origin = match[2] || null;
    var owner = match[3];
    var name = match[4];
    var checkout = match[5] || 'master';

    if (origin == null) {
      if (type === 'github') {
        origin = 'github.com';
      } else if (type === 'gitlab') {
        origin = 'gitlab.com';
      } else if (type === 'bitbucket') {
        origin = 'bitbucket.org';
      }
    }

    return {
      type: type,
      origin: origin,
      owner: owner,
      name: name,
      checkout: checkout
    }
  }
}

/**
 * Adds protocol to url in none specified
 *
 * @param {String} url
 * @return {String}
 */

function addProtocol (origin, clone) {
  if (!/^(f|ht)tps?:\/\//i.test(origin)) {
    if (clone) {
      origin = 'git@' + origin;
    } else {
      origin = 'https://' + origin;
    }
  }

  return origin
}

/**
 * Return a zip or git url for a given `repo`.
 *
 * @param {Object} repo
 * @return {String}
 */

function getUrl (repo, clone) {
  var url;

  // Get origin with protocol and add trailing slash or colon (for ssh)
  var origin = addProtocol(repo.origin, clone);
  if (/^git@/i.test(origin)) {
    origin = origin + ':';
  } else {
    origin = origin + '/';
  }

  // Build url
  if (clone) {
    url = origin + repo.owner + '/' + repo.name + '.git';
  } else {
    if (repo.type === 'github') {
      url = origin + repo.owner + '/' + repo.name + '/archive/' + repo.checkout + '.zip';
    } else if (repo.type === 'gitlab') {
      url = origin + repo.owner + '/' + repo.name + '/repository/archive.zip?ref=' + repo.checkout;
    } else if (repo.type === 'bitbucket') {
      url = origin + repo.owner + '/' + repo.name + '/get/' + repo.checkout + '.zip';
    }
  }

  return url
}

var download$1 = /*@__PURE__*/getDefaultExportFromCjs(downloadGitRepo);

const isBackspaceKey = (key) => key.name === 'backspace';
const isEnterKey = (key) => key.name === 'enter' || key.name === 'return';

class CancelPromptError extends Error {
    name = 'CancelPromptError';
    message = 'Prompt was canceled';
}
class ExitPromptError extends Error {
    name = 'ExitPromptError';
}
class HookError extends Error {
    name = 'HookError';
}
class ValidationError extends Error {
    name = 'ValidationError';
}

/* eslint @typescript-eslint/no-explicit-any: ["off"] */
const hookStorage = new AsyncLocalStorage();
function createStore(rl) {
    const store = {
        rl,
        hooks: [],
        hooksCleanup: [],
        hooksEffect: [],
        index: 0,
        handleChange() { },
    };
    return store;
}
// Run callback in with the hook engine setup.
function withHooks(rl, cb) {
    const store = createStore(rl);
    return hookStorage.run(store, () => {
        function cycle(render) {
            store.handleChange = () => {
                store.index = 0;
                render();
            };
            store.handleChange();
        }
        cb(cycle);
    });
}
// Safe getStore utility that'll return the store or throw if undefined.
function getStore() {
    const store = hookStorage.getStore();
    if (!store) {
        throw new HookError('[Inquirer] Hook functions can only be called from within a prompt');
    }
    return store;
}
function readline() {
    return getStore().rl;
}
// Merge state updates happening within the callback function to avoid multiple renders.
function withUpdates(fn) {
    const wrapped = (...args) => {
        const store = getStore();
        let shouldUpdate = false;
        const oldHandleChange = store.handleChange;
        store.handleChange = () => {
            shouldUpdate = true;
        };
        const returnValue = fn(...args);
        if (shouldUpdate) {
            oldHandleChange();
        }
        store.handleChange = oldHandleChange;
        return returnValue;
    };
    return AsyncResource.bind(wrapped);
}
function withPointer(cb) {
    const store = getStore();
    const { index } = store;
    const pointer = {
        get() {
            return store.hooks[index];
        },
        set(value) {
            store.hooks[index] = value;
        },
        initialized: index in store.hooks,
    };
    const returnValue = cb(pointer);
    store.index++;
    return returnValue;
}
function handleChange() {
    getStore().handleChange();
}
const effectScheduler = {
    queue(cb) {
        const store = getStore();
        const { index } = store;
        store.hooksEffect.push(() => {
            store.hooksCleanup[index]?.();
            const cleanFn = cb(readline());
            if (cleanFn != null && typeof cleanFn !== 'function') {
                throw new ValidationError('useEffect return value must be a cleanup function or nothing.');
            }
            store.hooksCleanup[index] = cleanFn;
        });
    },
    run() {
        const store = getStore();
        withUpdates(() => {
            store.hooksEffect.forEach((effect) => {
                effect();
            });
            // Warning: Clean the hooks before exiting the `withUpdates` block.
            // Failure to do so means an updates would hit the same effects again.
            store.hooksEffect.length = 0;
        })();
    },
    clearAll() {
        const store = getStore();
        store.hooksCleanup.forEach((cleanFn) => {
            cleanFn?.();
        });
        store.hooksEffect.length = 0;
        store.hooksCleanup.length = 0;
    },
};

function useState(defaultValue) {
    return withPointer((pointer) => {
        const setFn = (newValue) => {
            // Noop if the value is still the same.
            if (pointer.get() !== newValue) {
                pointer.set(newValue);
                // Trigger re-render
                handleChange();
            }
        };
        if (pointer.initialized) {
            return [pointer.get(), setFn];
        }
        const value = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
        pointer.set(value);
        return [value, setFn];
    });
}

function useEffect(cb, depArray) {
    withPointer((pointer) => {
        const oldDeps = pointer.get();
        const hasChanged = !Array.isArray(oldDeps) || depArray.some((dep, i) => !Object.is(dep, oldDeps[i]));
        if (hasChanged) {
            effectScheduler.queue(cb);
        }
        pointer.set(depArray);
    });
}

const tty = require$$0$b;

// eslint-disable-next-line no-warning-comments
// TODO: Use a better method when it's added to Node.js (https://github.com/nodejs/node/pull/40240)
// Lots of optionals here to support Deno.
const hasColors = tty?.WriteStream?.prototype?.hasColors?.() ?? false;

const format = (open, close) => {
	if (!hasColors) {
		return input => input;
	}

	const openCode = `\u001B[${open}m`;
	const closeCode = `\u001B[${close}m`;

	return input => {
		const string = input + ''; // eslint-disable-line no-implicit-coercion -- This is faster.
		let index = string.indexOf(closeCode);

		if (index === -1) {
			// Note: Intentionally not using string interpolation for performance reasons.
			return openCode + string + closeCode;
		}

		// Handle nested colors.

		// We could have done this, but it's too slow (as of Node.js 22).
		// return openCode + string.replaceAll(closeCode, openCode) + closeCode;

		let result = openCode;
		let lastIndex = 0;

		while (index !== -1) {
			result += string.slice(lastIndex, index) + openCode;
			lastIndex = index + closeCode.length;
			index = string.indexOf(closeCode, lastIndex);
		}

		result += string.slice(lastIndex) + closeCode;

		return result;
	};
};

const colors = {};

colors.reset = format(0, 0);
colors.bold = format(1, 22);
colors.dim = format(2, 22);
colors.italic = format(3, 23);
colors.underline = format(4, 24);
colors.overline = format(53, 55);
colors.inverse = format(7, 27);
colors.hidden = format(8, 28);
colors.strikethrough = format(9, 29);

colors.black = format(30, 39);
colors.red = format(31, 39);
colors.green = format(32, 39);
colors.yellow = format(33, 39);
colors.blue = format(34, 39);
colors.magenta = format(35, 39);
colors.cyan = format(36, 39);
colors.white = format(37, 39);
colors.gray = format(90, 39);

colors.bgBlack = format(40, 49);
colors.bgRed = format(41, 49);
colors.bgGreen = format(42, 49);
colors.bgYellow = format(43, 49);
colors.bgBlue = format(44, 49);
colors.bgMagenta = format(45, 49);
colors.bgCyan = format(46, 49);
colors.bgWhite = format(47, 49);
colors.bgGray = format(100, 49);

colors.redBright = format(91, 39);
colors.greenBright = format(92, 39);
colors.yellowBright = format(93, 39);
colors.blueBright = format(94, 39);
colors.magentaBright = format(95, 39);
colors.cyanBright = format(96, 39);
colors.whiteBright = format(97, 39);

colors.bgRedBright = format(101, 49);
colors.bgGreenBright = format(102, 49);
colors.bgYellowBright = format(103, 49);
colors.bgBlueBright = format(104, 49);
colors.bgMagentaBright = format(105, 49);
colors.bgCyanBright = format(106, 49);
colors.bgWhiteBright = format(107, 49);

var yoctocolorsCjs = colors;

var colors$1 = /*@__PURE__*/getDefaultExportFromCjs(yoctocolorsCjs);

var dots = {
	interval: 80,
	frames: [
		"⠋",
		"⠙",
		"⠹",
		"⠸",
		"⠼",
		"⠴",
		"⠦",
		"⠧",
		"⠇",
		"⠏"
	]
};
var dots2 = {
	interval: 80,
	frames: [
		"⣾",
		"⣽",
		"⣻",
		"⢿",
		"⡿",
		"⣟",
		"⣯",
		"⣷"
	]
};
var dots3 = {
	interval: 80,
	frames: [
		"⠋",
		"⠙",
		"⠚",
		"⠞",
		"⠖",
		"⠦",
		"⠴",
		"⠲",
		"⠳",
		"⠓"
	]
};
var dots4 = {
	interval: 80,
	frames: [
		"⠄",
		"⠆",
		"⠇",
		"⠋",
		"⠙",
		"⠸",
		"⠰",
		"⠠",
		"⠰",
		"⠸",
		"⠙",
		"⠋",
		"⠇",
		"⠆"
	]
};
var dots5 = {
	interval: 80,
	frames: [
		"⠋",
		"⠙",
		"⠚",
		"⠒",
		"⠂",
		"⠂",
		"⠒",
		"⠲",
		"⠴",
		"⠦",
		"⠖",
		"⠒",
		"⠐",
		"⠐",
		"⠒",
		"⠓",
		"⠋"
	]
};
var dots6 = {
	interval: 80,
	frames: [
		"⠁",
		"⠉",
		"⠙",
		"⠚",
		"⠒",
		"⠂",
		"⠂",
		"⠒",
		"⠲",
		"⠴",
		"⠤",
		"⠄",
		"⠄",
		"⠤",
		"⠴",
		"⠲",
		"⠒",
		"⠂",
		"⠂",
		"⠒",
		"⠚",
		"⠙",
		"⠉",
		"⠁"
	]
};
var dots7 = {
	interval: 80,
	frames: [
		"⠈",
		"⠉",
		"⠋",
		"⠓",
		"⠒",
		"⠐",
		"⠐",
		"⠒",
		"⠖",
		"⠦",
		"⠤",
		"⠠",
		"⠠",
		"⠤",
		"⠦",
		"⠖",
		"⠒",
		"⠐",
		"⠐",
		"⠒",
		"⠓",
		"⠋",
		"⠉",
		"⠈"
	]
};
var dots8 = {
	interval: 80,
	frames: [
		"⠁",
		"⠁",
		"⠉",
		"⠙",
		"⠚",
		"⠒",
		"⠂",
		"⠂",
		"⠒",
		"⠲",
		"⠴",
		"⠤",
		"⠄",
		"⠄",
		"⠤",
		"⠠",
		"⠠",
		"⠤",
		"⠦",
		"⠖",
		"⠒",
		"⠐",
		"⠐",
		"⠒",
		"⠓",
		"⠋",
		"⠉",
		"⠈",
		"⠈"
	]
};
var dots9 = {
	interval: 80,
	frames: [
		"⢹",
		"⢺",
		"⢼",
		"⣸",
		"⣇",
		"⡧",
		"⡗",
		"⡏"
	]
};
var dots10 = {
	interval: 80,
	frames: [
		"⢄",
		"⢂",
		"⢁",
		"⡁",
		"⡈",
		"⡐",
		"⡠"
	]
};
var dots11 = {
	interval: 100,
	frames: [
		"⠁",
		"⠂",
		"⠄",
		"⡀",
		"⢀",
		"⠠",
		"⠐",
		"⠈"
	]
};
var dots12 = {
	interval: 80,
	frames: [
		"⢀⠀",
		"⡀⠀",
		"⠄⠀",
		"⢂⠀",
		"⡂⠀",
		"⠅⠀",
		"⢃⠀",
		"⡃⠀",
		"⠍⠀",
		"⢋⠀",
		"⡋⠀",
		"⠍⠁",
		"⢋⠁",
		"⡋⠁",
		"⠍⠉",
		"⠋⠉",
		"⠋⠉",
		"⠉⠙",
		"⠉⠙",
		"⠉⠩",
		"⠈⢙",
		"⠈⡙",
		"⢈⠩",
		"⡀⢙",
		"⠄⡙",
		"⢂⠩",
		"⡂⢘",
		"⠅⡘",
		"⢃⠨",
		"⡃⢐",
		"⠍⡐",
		"⢋⠠",
		"⡋⢀",
		"⠍⡁",
		"⢋⠁",
		"⡋⠁",
		"⠍⠉",
		"⠋⠉",
		"⠋⠉",
		"⠉⠙",
		"⠉⠙",
		"⠉⠩",
		"⠈⢙",
		"⠈⡙",
		"⠈⠩",
		"⠀⢙",
		"⠀⡙",
		"⠀⠩",
		"⠀⢘",
		"⠀⡘",
		"⠀⠨",
		"⠀⢐",
		"⠀⡐",
		"⠀⠠",
		"⠀⢀",
		"⠀⡀"
	]
};
var dots13 = {
	interval: 80,
	frames: [
		"⣼",
		"⣹",
		"⢻",
		"⠿",
		"⡟",
		"⣏",
		"⣧",
		"⣶"
	]
};
var dots8Bit = {
	interval: 80,
	frames: [
		"⠀",
		"⠁",
		"⠂",
		"⠃",
		"⠄",
		"⠅",
		"⠆",
		"⠇",
		"⡀",
		"⡁",
		"⡂",
		"⡃",
		"⡄",
		"⡅",
		"⡆",
		"⡇",
		"⠈",
		"⠉",
		"⠊",
		"⠋",
		"⠌",
		"⠍",
		"⠎",
		"⠏",
		"⡈",
		"⡉",
		"⡊",
		"⡋",
		"⡌",
		"⡍",
		"⡎",
		"⡏",
		"⠐",
		"⠑",
		"⠒",
		"⠓",
		"⠔",
		"⠕",
		"⠖",
		"⠗",
		"⡐",
		"⡑",
		"⡒",
		"⡓",
		"⡔",
		"⡕",
		"⡖",
		"⡗",
		"⠘",
		"⠙",
		"⠚",
		"⠛",
		"⠜",
		"⠝",
		"⠞",
		"⠟",
		"⡘",
		"⡙",
		"⡚",
		"⡛",
		"⡜",
		"⡝",
		"⡞",
		"⡟",
		"⠠",
		"⠡",
		"⠢",
		"⠣",
		"⠤",
		"⠥",
		"⠦",
		"⠧",
		"⡠",
		"⡡",
		"⡢",
		"⡣",
		"⡤",
		"⡥",
		"⡦",
		"⡧",
		"⠨",
		"⠩",
		"⠪",
		"⠫",
		"⠬",
		"⠭",
		"⠮",
		"⠯",
		"⡨",
		"⡩",
		"⡪",
		"⡫",
		"⡬",
		"⡭",
		"⡮",
		"⡯",
		"⠰",
		"⠱",
		"⠲",
		"⠳",
		"⠴",
		"⠵",
		"⠶",
		"⠷",
		"⡰",
		"⡱",
		"⡲",
		"⡳",
		"⡴",
		"⡵",
		"⡶",
		"⡷",
		"⠸",
		"⠹",
		"⠺",
		"⠻",
		"⠼",
		"⠽",
		"⠾",
		"⠿",
		"⡸",
		"⡹",
		"⡺",
		"⡻",
		"⡼",
		"⡽",
		"⡾",
		"⡿",
		"⢀",
		"⢁",
		"⢂",
		"⢃",
		"⢄",
		"⢅",
		"⢆",
		"⢇",
		"⣀",
		"⣁",
		"⣂",
		"⣃",
		"⣄",
		"⣅",
		"⣆",
		"⣇",
		"⢈",
		"⢉",
		"⢊",
		"⢋",
		"⢌",
		"⢍",
		"⢎",
		"⢏",
		"⣈",
		"⣉",
		"⣊",
		"⣋",
		"⣌",
		"⣍",
		"⣎",
		"⣏",
		"⢐",
		"⢑",
		"⢒",
		"⢓",
		"⢔",
		"⢕",
		"⢖",
		"⢗",
		"⣐",
		"⣑",
		"⣒",
		"⣓",
		"⣔",
		"⣕",
		"⣖",
		"⣗",
		"⢘",
		"⢙",
		"⢚",
		"⢛",
		"⢜",
		"⢝",
		"⢞",
		"⢟",
		"⣘",
		"⣙",
		"⣚",
		"⣛",
		"⣜",
		"⣝",
		"⣞",
		"⣟",
		"⢠",
		"⢡",
		"⢢",
		"⢣",
		"⢤",
		"⢥",
		"⢦",
		"⢧",
		"⣠",
		"⣡",
		"⣢",
		"⣣",
		"⣤",
		"⣥",
		"⣦",
		"⣧",
		"⢨",
		"⢩",
		"⢪",
		"⢫",
		"⢬",
		"⢭",
		"⢮",
		"⢯",
		"⣨",
		"⣩",
		"⣪",
		"⣫",
		"⣬",
		"⣭",
		"⣮",
		"⣯",
		"⢰",
		"⢱",
		"⢲",
		"⢳",
		"⢴",
		"⢵",
		"⢶",
		"⢷",
		"⣰",
		"⣱",
		"⣲",
		"⣳",
		"⣴",
		"⣵",
		"⣶",
		"⣷",
		"⢸",
		"⢹",
		"⢺",
		"⢻",
		"⢼",
		"⢽",
		"⢾",
		"⢿",
		"⣸",
		"⣹",
		"⣺",
		"⣻",
		"⣼",
		"⣽",
		"⣾",
		"⣿"
	]
};
var sand = {
	interval: 80,
	frames: [
		"⠁",
		"⠂",
		"⠄",
		"⡀",
		"⡈",
		"⡐",
		"⡠",
		"⣀",
		"⣁",
		"⣂",
		"⣄",
		"⣌",
		"⣔",
		"⣤",
		"⣥",
		"⣦",
		"⣮",
		"⣶",
		"⣷",
		"⣿",
		"⡿",
		"⠿",
		"⢟",
		"⠟",
		"⡛",
		"⠛",
		"⠫",
		"⢋",
		"⠋",
		"⠍",
		"⡉",
		"⠉",
		"⠑",
		"⠡",
		"⢁"
	]
};
var line = {
	interval: 130,
	frames: [
		"-",
		"\\",
		"|",
		"/"
	]
};
var line2 = {
	interval: 100,
	frames: [
		"⠂",
		"-",
		"–",
		"—",
		"–",
		"-"
	]
};
var pipe = {
	interval: 100,
	frames: [
		"┤",
		"┘",
		"┴",
		"└",
		"├",
		"┌",
		"┬",
		"┐"
	]
};
var simpleDots = {
	interval: 400,
	frames: [
		".  ",
		".. ",
		"...",
		"   "
	]
};
var simpleDotsScrolling = {
	interval: 200,
	frames: [
		".  ",
		".. ",
		"...",
		" ..",
		"  .",
		"   "
	]
};
var star = {
	interval: 70,
	frames: [
		"✶",
		"✸",
		"✹",
		"✺",
		"✹",
		"✷"
	]
};
var star2 = {
	interval: 80,
	frames: [
		"+",
		"x",
		"*"
	]
};
var flip = {
	interval: 70,
	frames: [
		"_",
		"_",
		"_",
		"-",
		"`",
		"`",
		"'",
		"´",
		"-",
		"_",
		"_",
		"_"
	]
};
var hamburger = {
	interval: 100,
	frames: [
		"☱",
		"☲",
		"☴"
	]
};
var growVertical = {
	interval: 120,
	frames: [
		"▁",
		"▃",
		"▄",
		"▅",
		"▆",
		"▇",
		"▆",
		"▅",
		"▄",
		"▃"
	]
};
var growHorizontal = {
	interval: 120,
	frames: [
		"▏",
		"▎",
		"▍",
		"▌",
		"▋",
		"▊",
		"▉",
		"▊",
		"▋",
		"▌",
		"▍",
		"▎"
	]
};
var balloon = {
	interval: 140,
	frames: [
		" ",
		".",
		"o",
		"O",
		"@",
		"*",
		" "
	]
};
var balloon2 = {
	interval: 120,
	frames: [
		".",
		"o",
		"O",
		"°",
		"O",
		"o",
		"."
	]
};
var noise = {
	interval: 100,
	frames: [
		"▓",
		"▒",
		"░"
	]
};
var bounce = {
	interval: 120,
	frames: [
		"⠁",
		"⠂",
		"⠄",
		"⠂"
	]
};
var boxBounce = {
	interval: 120,
	frames: [
		"▖",
		"▘",
		"▝",
		"▗"
	]
};
var boxBounce2 = {
	interval: 100,
	frames: [
		"▌",
		"▀",
		"▐",
		"▄"
	]
};
var triangle = {
	interval: 50,
	frames: [
		"◢",
		"◣",
		"◤",
		"◥"
	]
};
var binary = {
	interval: 80,
	frames: [
		"010010",
		"001100",
		"100101",
		"111010",
		"111101",
		"010111",
		"101011",
		"111000",
		"110011",
		"110101"
	]
};
var arc = {
	interval: 100,
	frames: [
		"◜",
		"◠",
		"◝",
		"◞",
		"◡",
		"◟"
	]
};
var circle = {
	interval: 120,
	frames: [
		"◡",
		"⊙",
		"◠"
	]
};
var squareCorners = {
	interval: 180,
	frames: [
		"◰",
		"◳",
		"◲",
		"◱"
	]
};
var circleQuarters = {
	interval: 120,
	frames: [
		"◴",
		"◷",
		"◶",
		"◵"
	]
};
var circleHalves = {
	interval: 50,
	frames: [
		"◐",
		"◓",
		"◑",
		"◒"
	]
};
var squish = {
	interval: 100,
	frames: [
		"╫",
		"╪"
	]
};
var toggle = {
	interval: 250,
	frames: [
		"⊶",
		"⊷"
	]
};
var toggle2 = {
	interval: 80,
	frames: [
		"▫",
		"▪"
	]
};
var toggle3 = {
	interval: 120,
	frames: [
		"□",
		"■"
	]
};
var toggle4 = {
	interval: 100,
	frames: [
		"■",
		"□",
		"▪",
		"▫"
	]
};
var toggle5 = {
	interval: 100,
	frames: [
		"▮",
		"▯"
	]
};
var toggle6 = {
	interval: 300,
	frames: [
		"ဝ",
		"၀"
	]
};
var toggle7 = {
	interval: 80,
	frames: [
		"⦾",
		"⦿"
	]
};
var toggle8 = {
	interval: 100,
	frames: [
		"◍",
		"◌"
	]
};
var toggle9 = {
	interval: 100,
	frames: [
		"◉",
		"◎"
	]
};
var toggle10 = {
	interval: 100,
	frames: [
		"㊂",
		"㊀",
		"㊁"
	]
};
var toggle11 = {
	interval: 50,
	frames: [
		"⧇",
		"⧆"
	]
};
var toggle12 = {
	interval: 120,
	frames: [
		"☗",
		"☖"
	]
};
var toggle13 = {
	interval: 80,
	frames: [
		"=",
		"*",
		"-"
	]
};
var arrow = {
	interval: 100,
	frames: [
		"←",
		"↖",
		"↑",
		"↗",
		"→",
		"↘",
		"↓",
		"↙"
	]
};
var arrow2 = {
	interval: 80,
	frames: [
		"⬆️ ",
		"↗️ ",
		"➡️ ",
		"↘️ ",
		"⬇️ ",
		"↙️ ",
		"⬅️ ",
		"↖️ "
	]
};
var arrow3 = {
	interval: 120,
	frames: [
		"▹▹▹▹▹",
		"▸▹▹▹▹",
		"▹▸▹▹▹",
		"▹▹▸▹▹",
		"▹▹▹▸▹",
		"▹▹▹▹▸"
	]
};
var bouncingBar = {
	interval: 80,
	frames: [
		"[    ]",
		"[=   ]",
		"[==  ]",
		"[=== ]",
		"[====]",
		"[ ===]",
		"[  ==]",
		"[   =]",
		"[    ]",
		"[   =]",
		"[  ==]",
		"[ ===]",
		"[====]",
		"[=== ]",
		"[==  ]",
		"[=   ]"
	]
};
var bouncingBall = {
	interval: 80,
	frames: [
		"( ●    )",
		"(  ●   )",
		"(   ●  )",
		"(    ● )",
		"(     ●)",
		"(    ● )",
		"(   ●  )",
		"(  ●   )",
		"( ●    )",
		"(●     )"
	]
};
var smiley = {
	interval: 200,
	frames: [
		"😄 ",
		"😝 "
	]
};
var monkey = {
	interval: 300,
	frames: [
		"🙈 ",
		"🙈 ",
		"🙉 ",
		"🙊 "
	]
};
var hearts = {
	interval: 100,
	frames: [
		"💛 ",
		"💙 ",
		"💜 ",
		"💚 ",
		"❤️ "
	]
};
var clock = {
	interval: 100,
	frames: [
		"🕛 ",
		"🕐 ",
		"🕑 ",
		"🕒 ",
		"🕓 ",
		"🕔 ",
		"🕕 ",
		"🕖 ",
		"🕗 ",
		"🕘 ",
		"🕙 ",
		"🕚 "
	]
};
var earth = {
	interval: 180,
	frames: [
		"🌍 ",
		"🌎 ",
		"🌏 "
	]
};
var material = {
	interval: 17,
	frames: [
		"█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
		"██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
		"███▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
		"████▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
		"██████▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
		"██████▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
		"███████▁▁▁▁▁▁▁▁▁▁▁▁▁",
		"████████▁▁▁▁▁▁▁▁▁▁▁▁",
		"█████████▁▁▁▁▁▁▁▁▁▁▁",
		"█████████▁▁▁▁▁▁▁▁▁▁▁",
		"██████████▁▁▁▁▁▁▁▁▁▁",
		"███████████▁▁▁▁▁▁▁▁▁",
		"█████████████▁▁▁▁▁▁▁",
		"██████████████▁▁▁▁▁▁",
		"██████████████▁▁▁▁▁▁",
		"▁██████████████▁▁▁▁▁",
		"▁██████████████▁▁▁▁▁",
		"▁██████████████▁▁▁▁▁",
		"▁▁██████████████▁▁▁▁",
		"▁▁▁██████████████▁▁▁",
		"▁▁▁▁█████████████▁▁▁",
		"▁▁▁▁██████████████▁▁",
		"▁▁▁▁██████████████▁▁",
		"▁▁▁▁▁██████████████▁",
		"▁▁▁▁▁██████████████▁",
		"▁▁▁▁▁██████████████▁",
		"▁▁▁▁▁▁██████████████",
		"▁▁▁▁▁▁██████████████",
		"▁▁▁▁▁▁▁█████████████",
		"▁▁▁▁▁▁▁█████████████",
		"▁▁▁▁▁▁▁▁████████████",
		"▁▁▁▁▁▁▁▁████████████",
		"▁▁▁▁▁▁▁▁▁███████████",
		"▁▁▁▁▁▁▁▁▁███████████",
		"▁▁▁▁▁▁▁▁▁▁██████████",
		"▁▁▁▁▁▁▁▁▁▁██████████",
		"▁▁▁▁▁▁▁▁▁▁▁▁████████",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁███████",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁██████",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████",
		"█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
		"██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
		"██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
		"███▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
		"████▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
		"█████▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
		"█████▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
		"██████▁▁▁▁▁▁▁▁▁▁▁▁▁█",
		"████████▁▁▁▁▁▁▁▁▁▁▁▁",
		"█████████▁▁▁▁▁▁▁▁▁▁▁",
		"█████████▁▁▁▁▁▁▁▁▁▁▁",
		"█████████▁▁▁▁▁▁▁▁▁▁▁",
		"█████████▁▁▁▁▁▁▁▁▁▁▁",
		"███████████▁▁▁▁▁▁▁▁▁",
		"████████████▁▁▁▁▁▁▁▁",
		"████████████▁▁▁▁▁▁▁▁",
		"██████████████▁▁▁▁▁▁",
		"██████████████▁▁▁▁▁▁",
		"▁██████████████▁▁▁▁▁",
		"▁██████████████▁▁▁▁▁",
		"▁▁▁█████████████▁▁▁▁",
		"▁▁▁▁▁████████████▁▁▁",
		"▁▁▁▁▁████████████▁▁▁",
		"▁▁▁▁▁▁███████████▁▁▁",
		"▁▁▁▁▁▁▁▁█████████▁▁▁",
		"▁▁▁▁▁▁▁▁█████████▁▁▁",
		"▁▁▁▁▁▁▁▁▁█████████▁▁",
		"▁▁▁▁▁▁▁▁▁█████████▁▁",
		"▁▁▁▁▁▁▁▁▁▁█████████▁",
		"▁▁▁▁▁▁▁▁▁▁▁████████▁",
		"▁▁▁▁▁▁▁▁▁▁▁████████▁",
		"▁▁▁▁▁▁▁▁▁▁▁▁███████▁",
		"▁▁▁▁▁▁▁▁▁▁▁▁███████▁",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁███████",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁███████",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
		"▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁"
	]
};
var moon = {
	interval: 80,
	frames: [
		"🌑 ",
		"🌒 ",
		"🌓 ",
		"🌔 ",
		"🌕 ",
		"🌖 ",
		"🌗 ",
		"🌘 "
	]
};
var runner = {
	interval: 140,
	frames: [
		"🚶 ",
		"🏃 "
	]
};
var pong = {
	interval: 80,
	frames: [
		"▐⠂       ▌",
		"▐⠈       ▌",
		"▐ ⠂      ▌",
		"▐ ⠠      ▌",
		"▐  ⡀     ▌",
		"▐  ⠠     ▌",
		"▐   ⠂    ▌",
		"▐   ⠈    ▌",
		"▐    ⠂   ▌",
		"▐    ⠠   ▌",
		"▐     ⡀  ▌",
		"▐     ⠠  ▌",
		"▐      ⠂ ▌",
		"▐      ⠈ ▌",
		"▐       ⠂▌",
		"▐       ⠠▌",
		"▐       ⡀▌",
		"▐      ⠠ ▌",
		"▐      ⠂ ▌",
		"▐     ⠈  ▌",
		"▐     ⠂  ▌",
		"▐    ⠠   ▌",
		"▐    ⡀   ▌",
		"▐   ⠠    ▌",
		"▐   ⠂    ▌",
		"▐  ⠈     ▌",
		"▐  ⠂     ▌",
		"▐ ⠠      ▌",
		"▐ ⡀      ▌",
		"▐⠠       ▌"
	]
};
var shark = {
	interval: 120,
	frames: [
		"▐|\\____________▌",
		"▐_|\\___________▌",
		"▐__|\\__________▌",
		"▐___|\\_________▌",
		"▐____|\\________▌",
		"▐_____|\\_______▌",
		"▐______|\\______▌",
		"▐_______|\\_____▌",
		"▐________|\\____▌",
		"▐_________|\\___▌",
		"▐__________|\\__▌",
		"▐___________|\\_▌",
		"▐____________|\\▌",
		"▐____________/|▌",
		"▐___________/|_▌",
		"▐__________/|__▌",
		"▐_________/|___▌",
		"▐________/|____▌",
		"▐_______/|_____▌",
		"▐______/|______▌",
		"▐_____/|_______▌",
		"▐____/|________▌",
		"▐___/|_________▌",
		"▐__/|__________▌",
		"▐_/|___________▌",
		"▐/|____________▌"
	]
};
var dqpb = {
	interval: 100,
	frames: [
		"d",
		"q",
		"p",
		"b"
	]
};
var weather = {
	interval: 100,
	frames: [
		"☀️ ",
		"☀️ ",
		"☀️ ",
		"🌤 ",
		"⛅️ ",
		"🌥 ",
		"☁️ ",
		"🌧 ",
		"🌨 ",
		"🌧 ",
		"🌨 ",
		"🌧 ",
		"🌨 ",
		"⛈ ",
		"🌨 ",
		"🌧 ",
		"🌨 ",
		"☁️ ",
		"🌥 ",
		"⛅️ ",
		"🌤 ",
		"☀️ ",
		"☀️ "
	]
};
var christmas = {
	interval: 400,
	frames: [
		"🌲",
		"🎄"
	]
};
var grenade = {
	interval: 80,
	frames: [
		"،  ",
		"′  ",
		" ´ ",
		" ‾ ",
		"  ⸌",
		"  ⸊",
		"  |",
		"  ⁎",
		"  ⁕",
		" ෴ ",
		"  ⁓",
		"   ",
		"   ",
		"   "
	]
};
var point = {
	interval: 125,
	frames: [
		"∙∙∙",
		"●∙∙",
		"∙●∙",
		"∙∙●",
		"∙∙∙"
	]
};
var layer = {
	interval: 150,
	frames: [
		"-",
		"=",
		"≡"
	]
};
var betaWave = {
	interval: 80,
	frames: [
		"ρββββββ",
		"βρβββββ",
		"ββρββββ",
		"βββρβββ",
		"ββββρββ",
		"βββββρβ",
		"ββββββρ"
	]
};
var fingerDance = {
	interval: 160,
	frames: [
		"🤘 ",
		"🤟 ",
		"🖖 ",
		"✋ ",
		"🤚 ",
		"👆 "
	]
};
var fistBump = {
	interval: 80,
	frames: [
		"🤜　　　　🤛 ",
		"🤜　　　　🤛 ",
		"🤜　　　　🤛 ",
		"　🤜　　🤛　 ",
		"　　🤜🤛　　 ",
		"　🤜✨🤛　　 ",
		"🤜　✨　🤛　 "
	]
};
var soccerHeader = {
	interval: 80,
	frames: [
		" 🧑⚽️       🧑 ",
		"🧑  ⚽️      🧑 ",
		"🧑   ⚽️     🧑 ",
		"🧑    ⚽️    🧑 ",
		"🧑     ⚽️   🧑 ",
		"🧑      ⚽️  🧑 ",
		"🧑       ⚽️🧑  ",
		"🧑      ⚽️  🧑 ",
		"🧑     ⚽️   🧑 ",
		"🧑    ⚽️    🧑 ",
		"🧑   ⚽️     🧑 ",
		"🧑  ⚽️      🧑 "
	]
};
var mindblown = {
	interval: 160,
	frames: [
		"😐 ",
		"😐 ",
		"😮 ",
		"😮 ",
		"😦 ",
		"😦 ",
		"😧 ",
		"😧 ",
		"🤯 ",
		"💥 ",
		"✨ ",
		"　 ",
		"　 ",
		"　 "
	]
};
var speaker = {
	interval: 160,
	frames: [
		"🔈 ",
		"🔉 ",
		"🔊 ",
		"🔉 "
	]
};
var orangePulse = {
	interval: 100,
	frames: [
		"🔸 ",
		"🔶 ",
		"🟠 ",
		"🟠 ",
		"🔶 "
	]
};
var bluePulse = {
	interval: 100,
	frames: [
		"🔹 ",
		"🔷 ",
		"🔵 ",
		"🔵 ",
		"🔷 "
	]
};
var orangeBluePulse = {
	interval: 100,
	frames: [
		"🔸 ",
		"🔶 ",
		"🟠 ",
		"🟠 ",
		"🔶 ",
		"🔹 ",
		"🔷 ",
		"🔵 ",
		"🔵 ",
		"🔷 "
	]
};
var timeTravel = {
	interval: 100,
	frames: [
		"🕛 ",
		"🕚 ",
		"🕙 ",
		"🕘 ",
		"🕗 ",
		"🕖 ",
		"🕕 ",
		"🕔 ",
		"🕓 ",
		"🕒 ",
		"🕑 ",
		"🕐 "
	]
};
var aesthetic = {
	interval: 80,
	frames: [
		"▰▱▱▱▱▱▱",
		"▰▰▱▱▱▱▱",
		"▰▰▰▱▱▱▱",
		"▰▰▰▰▱▱▱",
		"▰▰▰▰▰▱▱",
		"▰▰▰▰▰▰▱",
		"▰▰▰▰▰▰▰",
		"▰▱▱▱▱▱▱"
	]
};
var dwarfFortress = {
	interval: 80,
	frames: [
		" ██████£££  ",
		"☺██████£££  ",
		"☺██████£££  ",
		"☺▓█████£££  ",
		"☺▓█████£££  ",
		"☺▒█████£££  ",
		"☺▒█████£££  ",
		"☺░█████£££  ",
		"☺░█████£££  ",
		"☺ █████£££  ",
		" ☺█████£££  ",
		" ☺█████£££  ",
		" ☺▓████£££  ",
		" ☺▓████£££  ",
		" ☺▒████£££  ",
		" ☺▒████£££  ",
		" ☺░████£££  ",
		" ☺░████£££  ",
		" ☺ ████£££  ",
		"  ☺████£££  ",
		"  ☺████£££  ",
		"  ☺▓███£££  ",
		"  ☺▓███£££  ",
		"  ☺▒███£££  ",
		"  ☺▒███£££  ",
		"  ☺░███£££  ",
		"  ☺░███£££  ",
		"  ☺ ███£££  ",
		"   ☺███£££  ",
		"   ☺███£££  ",
		"   ☺▓██£££  ",
		"   ☺▓██£££  ",
		"   ☺▒██£££  ",
		"   ☺▒██£££  ",
		"   ☺░██£££  ",
		"   ☺░██£££  ",
		"   ☺ ██£££  ",
		"    ☺██£££  ",
		"    ☺██£££  ",
		"    ☺▓█£££  ",
		"    ☺▓█£££  ",
		"    ☺▒█£££  ",
		"    ☺▒█£££  ",
		"    ☺░█£££  ",
		"    ☺░█£££  ",
		"    ☺ █£££  ",
		"     ☺█£££  ",
		"     ☺█£££  ",
		"     ☺▓£££  ",
		"     ☺▓£££  ",
		"     ☺▒£££  ",
		"     ☺▒£££  ",
		"     ☺░£££  ",
		"     ☺░£££  ",
		"     ☺ £££  ",
		"      ☺£££  ",
		"      ☺£££  ",
		"      ☺▓££  ",
		"      ☺▓££  ",
		"      ☺▒££  ",
		"      ☺▒££  ",
		"      ☺░££  ",
		"      ☺░££  ",
		"      ☺ ££  ",
		"       ☺££  ",
		"       ☺££  ",
		"       ☺▓£  ",
		"       ☺▓£  ",
		"       ☺▒£  ",
		"       ☺▒£  ",
		"       ☺░£  ",
		"       ☺░£  ",
		"       ☺ £  ",
		"        ☺£  ",
		"        ☺£  ",
		"        ☺▓  ",
		"        ☺▓  ",
		"        ☺▒  ",
		"        ☺▒  ",
		"        ☺░  ",
		"        ☺░  ",
		"        ☺   ",
		"        ☺  &",
		"        ☺ ☼&",
		"       ☺ ☼ &",
		"       ☺☼  &",
		"      ☺☼  & ",
		"      ‼   & ",
		"     ☺   &  ",
		"    ‼    &  ",
		"   ☺    &   ",
		"  ‼     &   ",
		" ☺     &    ",
		"‼      &    ",
		"      &     ",
		"      &     ",
		"     &   ░  ",
		"     &   ▒  ",
		"    &    ▓  ",
		"    &    £  ",
		"   &    ░£  ",
		"   &    ▒£  ",
		"  &     ▓£  ",
		"  &     ££  ",
		" &     ░££  ",
		" &     ▒££  ",
		"&      ▓££  ",
		"&      £££  ",
		"      ░£££  ",
		"      ▒£££  ",
		"      ▓£££  ",
		"      █£££  ",
		"     ░█£££  ",
		"     ▒█£££  ",
		"     ▓█£££  ",
		"     ██£££  ",
		"    ░██£££  ",
		"    ▒██£££  ",
		"    ▓██£££  ",
		"    ███£££  ",
		"   ░███£££  ",
		"   ▒███£££  ",
		"   ▓███£££  ",
		"   ████£££  ",
		"  ░████£££  ",
		"  ▒████£££  ",
		"  ▓████£££  ",
		"  █████£££  ",
		" ░█████£££  ",
		" ▒█████£££  ",
		" ▓█████£££  ",
		" ██████£££  ",
		" ██████£££  "
	]
};
var require$$0 = {
	dots: dots,
	dots2: dots2,
	dots3: dots3,
	dots4: dots4,
	dots5: dots5,
	dots6: dots6,
	dots7: dots7,
	dots8: dots8,
	dots9: dots9,
	dots10: dots10,
	dots11: dots11,
	dots12: dots12,
	dots13: dots13,
	dots8Bit: dots8Bit,
	sand: sand,
	line: line,
	line2: line2,
	pipe: pipe,
	simpleDots: simpleDots,
	simpleDotsScrolling: simpleDotsScrolling,
	star: star,
	star2: star2,
	flip: flip,
	hamburger: hamburger,
	growVertical: growVertical,
	growHorizontal: growHorizontal,
	balloon: balloon,
	balloon2: balloon2,
	noise: noise,
	bounce: bounce,
	boxBounce: boxBounce,
	boxBounce2: boxBounce2,
	triangle: triangle,
	binary: binary,
	arc: arc,
	circle: circle,
	squareCorners: squareCorners,
	circleQuarters: circleQuarters,
	circleHalves: circleHalves,
	squish: squish,
	toggle: toggle,
	toggle2: toggle2,
	toggle3: toggle3,
	toggle4: toggle4,
	toggle5: toggle5,
	toggle6: toggle6,
	toggle7: toggle7,
	toggle8: toggle8,
	toggle9: toggle9,
	toggle10: toggle10,
	toggle11: toggle11,
	toggle12: toggle12,
	toggle13: toggle13,
	arrow: arrow,
	arrow2: arrow2,
	arrow3: arrow3,
	bouncingBar: bouncingBar,
	bouncingBall: bouncingBall,
	smiley: smiley,
	monkey: monkey,
	hearts: hearts,
	clock: clock,
	earth: earth,
	material: material,
	moon: moon,
	runner: runner,
	pong: pong,
	shark: shark,
	dqpb: dqpb,
	weather: weather,
	christmas: christmas,
	grenade: grenade,
	point: point,
	layer: layer,
	betaWave: betaWave,
	fingerDance: fingerDance,
	fistBump: fistBump,
	soccerHeader: soccerHeader,
	mindblown: mindblown,
	speaker: speaker,
	orangePulse: orangePulse,
	bluePulse: bluePulse,
	orangeBluePulse: orangeBluePulse,
	timeTravel: timeTravel,
	aesthetic: aesthetic,
	dwarfFortress: dwarfFortress
};

const spinners = Object.assign({}, require$$0); // eslint-disable-line import/extensions

const spinnersList = Object.keys(spinners);

Object.defineProperty(spinners, 'random', {
	get() {
		const randomIndex = Math.floor(Math.random() * spinnersList.length);
		const spinnerName = spinnersList[randomIndex];
		return spinners[spinnerName];
	}
});

var cliSpinners = spinners;

var spinners$1 = /*@__PURE__*/getDefaultExportFromCjs(cliSpinners);

const defaultTheme = {
    prefix: colors$1.green('?'),
    spinner: {
        interval: spinners$1.dots.interval,
        frames: spinners$1.dots.frames.map((frame) => colors$1.yellow(frame)),
    },
    style: {
        answer: colors$1.cyan,
        message: colors$1.bold,
        error: (text) => colors$1.red(`> ${text}`),
        defaultAnswer: (text) => colors$1.dim(`(${text})`),
        help: colors$1.dim,
        highlight: colors$1.cyan,
        key: (text) => colors$1.cyan(colors$1.bold(`<${text}>`)),
    },
};

function isPlainObject(value) {
    if (typeof value !== 'object' || value === null)
        return false;
    let proto = value;
    while (Object.getPrototypeOf(proto) !== null) {
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(value) === proto;
}
function deepMerge(...objects) {
    const output = {};
    for (const obj of objects) {
        for (const [key, value] of Object.entries(obj)) {
            const prevValue = output[key];
            output[key] =
                isPlainObject(prevValue) && isPlainObject(value)
                    ? deepMerge(prevValue, value)
                    : value;
        }
    }
    return output;
}
function makeTheme(...themes) {
    const themesToMerge = [
        defaultTheme,
        ...themes.filter((theme) => theme != null),
    ];
    return deepMerge(...themesToMerge);
}

function usePrefix({ isLoading = false, theme, }) {
    const [showLoader, setShowLoader] = useState(false);
    const [tick, setTick] = useState(0);
    const { prefix, spinner } = makeTheme(theme);
    useEffect(() => {
        if (isLoading) {
            let tickInterval;
            let inc = -1;
            // Delay displaying spinner by 300ms, to avoid flickering
            const delayTimeout = setTimeout(AsyncResource.bind(() => {
                setShowLoader(true);
                tickInterval = setInterval(AsyncResource.bind(() => {
                    inc = inc + 1;
                    setTick(inc % spinner.frames.length);
                }), spinner.interval);
            }), 300);
            return () => {
                clearTimeout(delayTimeout);
                clearInterval(tickInterval);
            };
        }
        else {
            setShowLoader(false);
        }
    }, [isLoading]);
    if (showLoader) {
        return spinner.frames[tick];
    }
    return prefix;
}

function useRef(val) {
    return useState({ current: val })[0];
}

function useKeypress(userHandler) {
    const signal = useRef(userHandler);
    signal.current = userHandler;
    useEffect((rl) => {
        let ignore = false;
        const handler = withUpdates((_input, event) => {
            if (ignore)
                return;
            void signal.current(event, rl);
        });
        rl.input.on('keypress', handler);
        return () => {
            ignore = true;
            rl.input.removeListener('keypress', handler);
        };
    }, []);
}

var cliWidth_1 = cliWidth;

function normalizeOpts(options) {
  const defaultOpts = {
    defaultWidth: 0,
    output: process.stdout,
    tty: require$$0$c,
  };

  if (!options) {
    return defaultOpts;
  }

  Object.keys(defaultOpts).forEach(function (key) {
    if (!options[key]) {
      options[key] = defaultOpts[key];
    }
  });

  return options;
}

function cliWidth(options) {
  const opts = normalizeOpts(options);

  if (opts.output.getWindowSize) {
    return opts.output.getWindowSize()[0] || opts.defaultWidth;
  }

  if (opts.tty.getWindowSize) {
    return opts.tty.getWindowSize()[1] || opts.defaultWidth;
  }

  if (opts.output.columns) {
    return opts.output.columns;
  }

  if (process.env.CLI_WIDTH) {
    const width = parseInt(process.env.CLI_WIDTH, 10);

    if (!isNaN(width) && width !== 0) {
      return width;
    }
  }

  return opts.defaultWidth;
}

var cliWidth$1 = /*@__PURE__*/getDefaultExportFromCjs(cliWidth_1);

var stringWidth$2 = {exports: {}};

var ansiRegex$1 = ({onlyFirst = false} = {}) => {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|');

	return new RegExp(pattern, onlyFirst ? undefined : 'g');
};

const ansiRegex = ansiRegex$1;

var stripAnsi$2 = string => typeof string === 'string' ? string.replace(ansiRegex(), '') : string;

var stripAnsi$3 = /*@__PURE__*/getDefaultExportFromCjs(stripAnsi$2);

var isFullwidthCodePoint$2 = {exports: {}};

/* eslint-disable yoda */

const isFullwidthCodePoint$1 = codePoint => {
	if (Number.isNaN(codePoint)) {
		return false;
	}

	// Code points are derived from:
	// http://www.unix.org/Public/UNIDATA/EastAsianWidth.txt
	if (
		codePoint >= 0x1100 && (
			codePoint <= 0x115F || // Hangul Jamo
			codePoint === 0x2329 || // LEFT-POINTING ANGLE BRACKET
			codePoint === 0x232A || // RIGHT-POINTING ANGLE BRACKET
			// CJK Radicals Supplement .. Enclosed CJK Letters and Months
			(0x2E80 <= codePoint && codePoint <= 0x3247 && codePoint !== 0x303F) ||
			// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
			(0x3250 <= codePoint && codePoint <= 0x4DBF) ||
			// CJK Unified Ideographs .. Yi Radicals
			(0x4E00 <= codePoint && codePoint <= 0xA4C6) ||
			// Hangul Jamo Extended-A
			(0xA960 <= codePoint && codePoint <= 0xA97C) ||
			// Hangul Syllables
			(0xAC00 <= codePoint && codePoint <= 0xD7A3) ||
			// CJK Compatibility Ideographs
			(0xF900 <= codePoint && codePoint <= 0xFAFF) ||
			// Vertical Forms
			(0xFE10 <= codePoint && codePoint <= 0xFE19) ||
			// CJK Compatibility Forms .. Small Form Variants
			(0xFE30 <= codePoint && codePoint <= 0xFE6B) ||
			// Halfwidth and Fullwidth Forms
			(0xFF01 <= codePoint && codePoint <= 0xFF60) ||
			(0xFFE0 <= codePoint && codePoint <= 0xFFE6) ||
			// Kana Supplement
			(0x1B000 <= codePoint && codePoint <= 0x1B001) ||
			// Enclosed Ideographic Supplement
			(0x1F200 <= codePoint && codePoint <= 0x1F251) ||
			// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
			(0x20000 <= codePoint && codePoint <= 0x3FFFD)
		)
	) {
		return true;
	}

	return false;
};

isFullwidthCodePoint$2.exports = isFullwidthCodePoint$1;
isFullwidthCodePoint$2.exports.default = isFullwidthCodePoint$1;

var isFullwidthCodePointExports = isFullwidthCodePoint$2.exports;

var emojiRegex$1 = function () {
  // https://mths.be/emoji
  return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73)\uDB40\uDC7F|\uD83D\uDC68(?:\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68\uD83C\uDFFB|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|[\u2695\u2696\u2708]\uFE0F|\uD83D[\uDC66\uDC67]|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708])\uFE0F|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C[\uDFFB-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)\uD83C\uDFFB|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB\uDFFC])|\uD83D\uDC69(?:\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D\uD83D\uDC69)(?:\uD83C[\uDFFB-\uDFFD])|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|(?:(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)\uFE0F|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:(?:\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\u200D[\u2640\u2642])|\uD83C\uDFF4\u200D\u2620)\uFE0F|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF4\uD83C\uDDF2|\uD83C\uDDF6\uD83C\uDDE6|[#\*0-9]\uFE0F\u20E3|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83D\uDC69(?:\uD83C[\uDFFB-\uDFFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270A-\u270D]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC70\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDCAA\uDD74\uDD7A\uDD90\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD36\uDDB5\uDDB6\uDDBB\uDDD2-\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5\uDEEB\uDEEC\uDEF4-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFA\uDFE0-\uDFEB]|\uD83E[\uDD0D-\uDD3A\uDD3C-\uDD45\uDD47-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDDFF\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
};

const stripAnsi$1 = stripAnsi$2;
const isFullwidthCodePoint = isFullwidthCodePointExports;
const emojiRegex = emojiRegex$1;

const stringWidth$1 = string => {
	if (typeof string !== 'string' || string.length === 0) {
		return 0;
	}

	string = stripAnsi$1(string);

	if (string.length === 0) {
		return 0;
	}

	string = string.replace(emojiRegex(), '  ');

	let width = 0;

	for (let i = 0; i < string.length; i++) {
		const code = string.codePointAt(i);

		// Ignore control characters
		if (code <= 0x1F || (code >= 0x7F && code <= 0x9F)) {
			continue;
		}

		// Ignore combining characters
		if (code >= 0x300 && code <= 0x36F) {
			continue;
		}

		// Surrogates
		if (code > 0xFFFF) {
			i++;
		}

		width += isFullwidthCodePoint(code) ? 2 : 1;
	}

	return width;
};

stringWidth$2.exports = stringWidth$1;
// TODO: remove this in the next major version
stringWidth$2.exports.default = stringWidth$1;

var stringWidthExports = stringWidth$2.exports;

var ansiStyles$1 = {exports: {}};

var colorName;
var hasRequiredColorName;

function requireColorName () {
	if (hasRequiredColorName) return colorName;
	hasRequiredColorName = 1;

	colorName = {
		"aliceblue": [240, 248, 255],
		"antiquewhite": [250, 235, 215],
		"aqua": [0, 255, 255],
		"aquamarine": [127, 255, 212],
		"azure": [240, 255, 255],
		"beige": [245, 245, 220],
		"bisque": [255, 228, 196],
		"black": [0, 0, 0],
		"blanchedalmond": [255, 235, 205],
		"blue": [0, 0, 255],
		"blueviolet": [138, 43, 226],
		"brown": [165, 42, 42],
		"burlywood": [222, 184, 135],
		"cadetblue": [95, 158, 160],
		"chartreuse": [127, 255, 0],
		"chocolate": [210, 105, 30],
		"coral": [255, 127, 80],
		"cornflowerblue": [100, 149, 237],
		"cornsilk": [255, 248, 220],
		"crimson": [220, 20, 60],
		"cyan": [0, 255, 255],
		"darkblue": [0, 0, 139],
		"darkcyan": [0, 139, 139],
		"darkgoldenrod": [184, 134, 11],
		"darkgray": [169, 169, 169],
		"darkgreen": [0, 100, 0],
		"darkgrey": [169, 169, 169],
		"darkkhaki": [189, 183, 107],
		"darkmagenta": [139, 0, 139],
		"darkolivegreen": [85, 107, 47],
		"darkorange": [255, 140, 0],
		"darkorchid": [153, 50, 204],
		"darkred": [139, 0, 0],
		"darksalmon": [233, 150, 122],
		"darkseagreen": [143, 188, 143],
		"darkslateblue": [72, 61, 139],
		"darkslategray": [47, 79, 79],
		"darkslategrey": [47, 79, 79],
		"darkturquoise": [0, 206, 209],
		"darkviolet": [148, 0, 211],
		"deeppink": [255, 20, 147],
		"deepskyblue": [0, 191, 255],
		"dimgray": [105, 105, 105],
		"dimgrey": [105, 105, 105],
		"dodgerblue": [30, 144, 255],
		"firebrick": [178, 34, 34],
		"floralwhite": [255, 250, 240],
		"forestgreen": [34, 139, 34],
		"fuchsia": [255, 0, 255],
		"gainsboro": [220, 220, 220],
		"ghostwhite": [248, 248, 255],
		"gold": [255, 215, 0],
		"goldenrod": [218, 165, 32],
		"gray": [128, 128, 128],
		"green": [0, 128, 0],
		"greenyellow": [173, 255, 47],
		"grey": [128, 128, 128],
		"honeydew": [240, 255, 240],
		"hotpink": [255, 105, 180],
		"indianred": [205, 92, 92],
		"indigo": [75, 0, 130],
		"ivory": [255, 255, 240],
		"khaki": [240, 230, 140],
		"lavender": [230, 230, 250],
		"lavenderblush": [255, 240, 245],
		"lawngreen": [124, 252, 0],
		"lemonchiffon": [255, 250, 205],
		"lightblue": [173, 216, 230],
		"lightcoral": [240, 128, 128],
		"lightcyan": [224, 255, 255],
		"lightgoldenrodyellow": [250, 250, 210],
		"lightgray": [211, 211, 211],
		"lightgreen": [144, 238, 144],
		"lightgrey": [211, 211, 211],
		"lightpink": [255, 182, 193],
		"lightsalmon": [255, 160, 122],
		"lightseagreen": [32, 178, 170],
		"lightskyblue": [135, 206, 250],
		"lightslategray": [119, 136, 153],
		"lightslategrey": [119, 136, 153],
		"lightsteelblue": [176, 196, 222],
		"lightyellow": [255, 255, 224],
		"lime": [0, 255, 0],
		"limegreen": [50, 205, 50],
		"linen": [250, 240, 230],
		"magenta": [255, 0, 255],
		"maroon": [128, 0, 0],
		"mediumaquamarine": [102, 205, 170],
		"mediumblue": [0, 0, 205],
		"mediumorchid": [186, 85, 211],
		"mediumpurple": [147, 112, 219],
		"mediumseagreen": [60, 179, 113],
		"mediumslateblue": [123, 104, 238],
		"mediumspringgreen": [0, 250, 154],
		"mediumturquoise": [72, 209, 204],
		"mediumvioletred": [199, 21, 133],
		"midnightblue": [25, 25, 112],
		"mintcream": [245, 255, 250],
		"mistyrose": [255, 228, 225],
		"moccasin": [255, 228, 181],
		"navajowhite": [255, 222, 173],
		"navy": [0, 0, 128],
		"oldlace": [253, 245, 230],
		"olive": [128, 128, 0],
		"olivedrab": [107, 142, 35],
		"orange": [255, 165, 0],
		"orangered": [255, 69, 0],
		"orchid": [218, 112, 214],
		"palegoldenrod": [238, 232, 170],
		"palegreen": [152, 251, 152],
		"paleturquoise": [175, 238, 238],
		"palevioletred": [219, 112, 147],
		"papayawhip": [255, 239, 213],
		"peachpuff": [255, 218, 185],
		"peru": [205, 133, 63],
		"pink": [255, 192, 203],
		"plum": [221, 160, 221],
		"powderblue": [176, 224, 230],
		"purple": [128, 0, 128],
		"rebeccapurple": [102, 51, 153],
		"red": [255, 0, 0],
		"rosybrown": [188, 143, 143],
		"royalblue": [65, 105, 225],
		"saddlebrown": [139, 69, 19],
		"salmon": [250, 128, 114],
		"sandybrown": [244, 164, 96],
		"seagreen": [46, 139, 87],
		"seashell": [255, 245, 238],
		"sienna": [160, 82, 45],
		"silver": [192, 192, 192],
		"skyblue": [135, 206, 235],
		"slateblue": [106, 90, 205],
		"slategray": [112, 128, 144],
		"slategrey": [112, 128, 144],
		"snow": [255, 250, 250],
		"springgreen": [0, 255, 127],
		"steelblue": [70, 130, 180],
		"tan": [210, 180, 140],
		"teal": [0, 128, 128],
		"thistle": [216, 191, 216],
		"tomato": [255, 99, 71],
		"turquoise": [64, 224, 208],
		"violet": [238, 130, 238],
		"wheat": [245, 222, 179],
		"white": [255, 255, 255],
		"whitesmoke": [245, 245, 245],
		"yellow": [255, 255, 0],
		"yellowgreen": [154, 205, 50]
	};
	return colorName;
}

/* MIT license */

var conversions;
var hasRequiredConversions;

function requireConversions () {
	if (hasRequiredConversions) return conversions;
	hasRequiredConversions = 1;
	/* eslint-disable no-mixed-operators */
	const cssKeywords = requireColorName();

	// NOTE: conversions should only return primitive values (i.e. arrays, or
	//       values that give correct `typeof` results).
	//       do not use box values types (i.e. Number(), String(), etc.)

	const reverseKeywords = {};
	for (const key of Object.keys(cssKeywords)) {
		reverseKeywords[cssKeywords[key]] = key;
	}

	const convert = {
		rgb: {channels: 3, labels: 'rgb'},
		hsl: {channels: 3, labels: 'hsl'},
		hsv: {channels: 3, labels: 'hsv'},
		hwb: {channels: 3, labels: 'hwb'},
		cmyk: {channels: 4, labels: 'cmyk'},
		xyz: {channels: 3, labels: 'xyz'},
		lab: {channels: 3, labels: 'lab'},
		lch: {channels: 3, labels: 'lch'},
		hex: {channels: 1, labels: ['hex']},
		keyword: {channels: 1, labels: ['keyword']},
		ansi16: {channels: 1, labels: ['ansi16']},
		ansi256: {channels: 1, labels: ['ansi256']},
		hcg: {channels: 3, labels: ['h', 'c', 'g']},
		apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
		gray: {channels: 1, labels: ['gray']}
	};

	conversions = convert;

	// Hide .channels and .labels properties
	for (const model of Object.keys(convert)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		const {channels, labels} = convert[model];
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}

	convert.rgb.hsl = function (rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const min = Math.min(r, g, b);
		const max = Math.max(r, g, b);
		const delta = max - min;
		let h;
		let s;

		if (max === min) {
			h = 0;
		} else if (r === max) {
			h = (g - b) / delta;
		} else if (g === max) {
			h = 2 + (b - r) / delta;
		} else if (b === max) {
			h = 4 + (r - g) / delta;
		}

		h = Math.min(h * 60, 360);

		if (h < 0) {
			h += 360;
		}

		const l = (min + max) / 2;

		if (max === min) {
			s = 0;
		} else if (l <= 0.5) {
			s = delta / (max + min);
		} else {
			s = delta / (2 - max - min);
		}

		return [h, s * 100, l * 100];
	};

	convert.rgb.hsv = function (rgb) {
		let rdif;
		let gdif;
		let bdif;
		let h;
		let s;

		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const v = Math.max(r, g, b);
		const diff = v - Math.min(r, g, b);
		const diffc = function (c) {
			return (v - c) / 6 / diff + 1 / 2;
		};

		if (diff === 0) {
			h = 0;
			s = 0;
		} else {
			s = diff / v;
			rdif = diffc(r);
			gdif = diffc(g);
			bdif = diffc(b);

			if (r === v) {
				h = bdif - gdif;
			} else if (g === v) {
				h = (1 / 3) + rdif - bdif;
			} else if (b === v) {
				h = (2 / 3) + gdif - rdif;
			}

			if (h < 0) {
				h += 1;
			} else if (h > 1) {
				h -= 1;
			}
		}

		return [
			h * 360,
			s * 100,
			v * 100
		];
	};

	convert.rgb.hwb = function (rgb) {
		const r = rgb[0];
		const g = rgb[1];
		let b = rgb[2];
		const h = convert.rgb.hsl(rgb)[0];
		const w = 1 / 255 * Math.min(r, Math.min(g, b));

		b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

		return [h, w * 100, b * 100];
	};

	convert.rgb.cmyk = function (rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;

		const k = Math.min(1 - r, 1 - g, 1 - b);
		const c = (1 - r - k) / (1 - k) || 0;
		const m = (1 - g - k) / (1 - k) || 0;
		const y = (1 - b - k) / (1 - k) || 0;

		return [c * 100, m * 100, y * 100, k * 100];
	};

	function comparativeDistance(x, y) {
		/*
			See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
		*/
		return (
			((x[0] - y[0]) ** 2) +
			((x[1] - y[1]) ** 2) +
			((x[2] - y[2]) ** 2)
		);
	}

	convert.rgb.keyword = function (rgb) {
		const reversed = reverseKeywords[rgb];
		if (reversed) {
			return reversed;
		}

		let currentClosestDistance = Infinity;
		let currentClosestKeyword;

		for (const keyword of Object.keys(cssKeywords)) {
			const value = cssKeywords[keyword];

			// Compute comparative distance
			const distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}

		return currentClosestKeyword;
	};

	convert.keyword.rgb = function (keyword) {
		return cssKeywords[keyword];
	};

	convert.rgb.xyz = function (rgb) {
		let r = rgb[0] / 255;
		let g = rgb[1] / 255;
		let b = rgb[2] / 255;

		// Assume sRGB
		r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
		g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
		b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

		const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
		const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
		const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

		return [x * 100, y * 100, z * 100];
	};

	convert.rgb.lab = function (rgb) {
		const xyz = convert.rgb.xyz(rgb);
		let x = xyz[0];
		let y = xyz[1];
		let z = xyz[2];

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

		const l = (116 * y) - 16;
		const a = 500 * (x - y);
		const b = 200 * (y - z);

		return [l, a, b];
	};

	convert.hsl.rgb = function (hsl) {
		const h = hsl[0] / 360;
		const s = hsl[1] / 100;
		const l = hsl[2] / 100;
		let t2;
		let t3;
		let val;

		if (s === 0) {
			val = l * 255;
			return [val, val, val];
		}

		if (l < 0.5) {
			t2 = l * (1 + s);
		} else {
			t2 = l + s - l * s;
		}

		const t1 = 2 * l - t2;

		const rgb = [0, 0, 0];
		for (let i = 0; i < 3; i++) {
			t3 = h + 1 / 3 * -(i - 1);
			if (t3 < 0) {
				t3++;
			}

			if (t3 > 1) {
				t3--;
			}

			if (6 * t3 < 1) {
				val = t1 + (t2 - t1) * 6 * t3;
			} else if (2 * t3 < 1) {
				val = t2;
			} else if (3 * t3 < 2) {
				val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
			} else {
				val = t1;
			}

			rgb[i] = val * 255;
		}

		return rgb;
	};

	convert.hsl.hsv = function (hsl) {
		const h = hsl[0];
		let s = hsl[1] / 100;
		let l = hsl[2] / 100;
		let smin = s;
		const lmin = Math.max(l, 0.01);

		l *= 2;
		s *= (l <= 1) ? l : 2 - l;
		smin *= lmin <= 1 ? lmin : 2 - lmin;
		const v = (l + s) / 2;
		const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

		return [h, sv * 100, v * 100];
	};

	convert.hsv.rgb = function (hsv) {
		const h = hsv[0] / 60;
		const s = hsv[1] / 100;
		let v = hsv[2] / 100;
		const hi = Math.floor(h) % 6;

		const f = h - Math.floor(h);
		const p = 255 * v * (1 - s);
		const q = 255 * v * (1 - (s * f));
		const t = 255 * v * (1 - (s * (1 - f)));
		v *= 255;

		switch (hi) {
			case 0:
				return [v, t, p];
			case 1:
				return [q, v, p];
			case 2:
				return [p, v, t];
			case 3:
				return [p, q, v];
			case 4:
				return [t, p, v];
			case 5:
				return [v, p, q];
		}
	};

	convert.hsv.hsl = function (hsv) {
		const h = hsv[0];
		const s = hsv[1] / 100;
		const v = hsv[2] / 100;
		const vmin = Math.max(v, 0.01);
		let sl;
		let l;

		l = (2 - s) * v;
		const lmin = (2 - s) * vmin;
		sl = s * vmin;
		sl /= (lmin <= 1) ? lmin : 2 - lmin;
		sl = sl || 0;
		l /= 2;

		return [h, sl * 100, l * 100];
	};

	// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
	convert.hwb.rgb = function (hwb) {
		const h = hwb[0] / 360;
		let wh = hwb[1] / 100;
		let bl = hwb[2] / 100;
		const ratio = wh + bl;
		let f;

		// Wh + bl cant be > 1
		if (ratio > 1) {
			wh /= ratio;
			bl /= ratio;
		}

		const i = Math.floor(6 * h);
		const v = 1 - bl;
		f = 6 * h - i;

		if ((i & 0x01) !== 0) {
			f = 1 - f;
		}

		const n = wh + f * (v - wh); // Linear interpolation

		let r;
		let g;
		let b;
		/* eslint-disable max-statements-per-line,no-multi-spaces */
		switch (i) {
			default:
			case 6:
			case 0: r = v;  g = n;  b = wh; break;
			case 1: r = n;  g = v;  b = wh; break;
			case 2: r = wh; g = v;  b = n; break;
			case 3: r = wh; g = n;  b = v; break;
			case 4: r = n;  g = wh; b = v; break;
			case 5: r = v;  g = wh; b = n; break;
		}
		/* eslint-enable max-statements-per-line,no-multi-spaces */

		return [r * 255, g * 255, b * 255];
	};

	convert.cmyk.rgb = function (cmyk) {
		const c = cmyk[0] / 100;
		const m = cmyk[1] / 100;
		const y = cmyk[2] / 100;
		const k = cmyk[3] / 100;

		const r = 1 - Math.min(1, c * (1 - k) + k);
		const g = 1 - Math.min(1, m * (1 - k) + k);
		const b = 1 - Math.min(1, y * (1 - k) + k);

		return [r * 255, g * 255, b * 255];
	};

	convert.xyz.rgb = function (xyz) {
		const x = xyz[0] / 100;
		const y = xyz[1] / 100;
		const z = xyz[2] / 100;
		let r;
		let g;
		let b;

		r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
		g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
		b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

		// Assume sRGB
		r = r > 0.0031308
			? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
			: r * 12.92;

		g = g > 0.0031308
			? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
			: g * 12.92;

		b = b > 0.0031308
			? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
			: b * 12.92;

		r = Math.min(Math.max(0, r), 1);
		g = Math.min(Math.max(0, g), 1);
		b = Math.min(Math.max(0, b), 1);

		return [r * 255, g * 255, b * 255];
	};

	convert.xyz.lab = function (xyz) {
		let x = xyz[0];
		let y = xyz[1];
		let z = xyz[2];

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

		const l = (116 * y) - 16;
		const a = 500 * (x - y);
		const b = 200 * (y - z);

		return [l, a, b];
	};

	convert.lab.xyz = function (lab) {
		const l = lab[0];
		const a = lab[1];
		const b = lab[2];
		let x;
		let y;
		let z;

		y = (l + 16) / 116;
		x = a / 500 + y;
		z = y - b / 200;

		const y2 = y ** 3;
		const x2 = x ** 3;
		const z2 = z ** 3;
		y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
		x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
		z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

		x *= 95.047;
		y *= 100;
		z *= 108.883;

		return [x, y, z];
	};

	convert.lab.lch = function (lab) {
		const l = lab[0];
		const a = lab[1];
		const b = lab[2];
		let h;

		const hr = Math.atan2(b, a);
		h = hr * 360 / 2 / Math.PI;

		if (h < 0) {
			h += 360;
		}

		const c = Math.sqrt(a * a + b * b);

		return [l, c, h];
	};

	convert.lch.lab = function (lch) {
		const l = lch[0];
		const c = lch[1];
		const h = lch[2];

		const hr = h / 360 * 2 * Math.PI;
		const a = c * Math.cos(hr);
		const b = c * Math.sin(hr);

		return [l, a, b];
	};

	convert.rgb.ansi16 = function (args, saturation = null) {
		const [r, g, b] = args;
		let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

		value = Math.round(value / 50);

		if (value === 0) {
			return 30;
		}

		let ansi = 30
			+ ((Math.round(b / 255) << 2)
			| (Math.round(g / 255) << 1)
			| Math.round(r / 255));

		if (value === 2) {
			ansi += 60;
		}

		return ansi;
	};

	convert.hsv.ansi16 = function (args) {
		// Optimization here; we already know the value and don't need to get
		// it converted for us.
		return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
	};

	convert.rgb.ansi256 = function (args) {
		const r = args[0];
		const g = args[1];
		const b = args[2];

		// We use the extended greyscale palette here, with the exception of
		// black and white. normal palette only has 4 greyscale shades.
		if (r === g && g === b) {
			if (r < 8) {
				return 16;
			}

			if (r > 248) {
				return 231;
			}

			return Math.round(((r - 8) / 247) * 24) + 232;
		}

		const ansi = 16
			+ (36 * Math.round(r / 255 * 5))
			+ (6 * Math.round(g / 255 * 5))
			+ Math.round(b / 255 * 5);

		return ansi;
	};

	convert.ansi16.rgb = function (args) {
		let color = args % 10;

		// Handle greyscale
		if (color === 0 || color === 7) {
			if (args > 50) {
				color += 3.5;
			}

			color = color / 10.5 * 255;

			return [color, color, color];
		}

		const mult = (~~(args > 50) + 1) * 0.5;
		const r = ((color & 1) * mult) * 255;
		const g = (((color >> 1) & 1) * mult) * 255;
		const b = (((color >> 2) & 1) * mult) * 255;

		return [r, g, b];
	};

	convert.ansi256.rgb = function (args) {
		// Handle greyscale
		if (args >= 232) {
			const c = (args - 232) * 10 + 8;
			return [c, c, c];
		}

		args -= 16;

		let rem;
		const r = Math.floor(args / 36) / 5 * 255;
		const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
		const b = (rem % 6) / 5 * 255;

		return [r, g, b];
	};

	convert.rgb.hex = function (args) {
		const integer = ((Math.round(args[0]) & 0xFF) << 16)
			+ ((Math.round(args[1]) & 0xFF) << 8)
			+ (Math.round(args[2]) & 0xFF);

		const string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert.hex.rgb = function (args) {
		const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
		if (!match) {
			return [0, 0, 0];
		}

		let colorString = match[0];

		if (match[0].length === 3) {
			colorString = colorString.split('').map(char => {
				return char + char;
			}).join('');
		}

		const integer = parseInt(colorString, 16);
		const r = (integer >> 16) & 0xFF;
		const g = (integer >> 8) & 0xFF;
		const b = integer & 0xFF;

		return [r, g, b];
	};

	convert.rgb.hcg = function (rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const max = Math.max(Math.max(r, g), b);
		const min = Math.min(Math.min(r, g), b);
		const chroma = (max - min);
		let grayscale;
		let hue;

		if (chroma < 1) {
			grayscale = min / (1 - chroma);
		} else {
			grayscale = 0;
		}

		if (chroma <= 0) {
			hue = 0;
		} else
		if (max === r) {
			hue = ((g - b) / chroma) % 6;
		} else
		if (max === g) {
			hue = 2 + (b - r) / chroma;
		} else {
			hue = 4 + (r - g) / chroma;
		}

		hue /= 6;
		hue %= 1;

		return [hue * 360, chroma * 100, grayscale * 100];
	};

	convert.hsl.hcg = function (hsl) {
		const s = hsl[1] / 100;
		const l = hsl[2] / 100;

		const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

		let f = 0;
		if (c < 1.0) {
			f = (l - 0.5 * c) / (1.0 - c);
		}

		return [hsl[0], c * 100, f * 100];
	};

	convert.hsv.hcg = function (hsv) {
		const s = hsv[1] / 100;
		const v = hsv[2] / 100;

		const c = s * v;
		let f = 0;

		if (c < 1.0) {
			f = (v - c) / (1 - c);
		}

		return [hsv[0], c * 100, f * 100];
	};

	convert.hcg.rgb = function (hcg) {
		const h = hcg[0] / 360;
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;

		if (c === 0.0) {
			return [g * 255, g * 255, g * 255];
		}

		const pure = [0, 0, 0];
		const hi = (h % 1) * 6;
		const v = hi % 1;
		const w = 1 - v;
		let mg = 0;

		/* eslint-disable max-statements-per-line */
		switch (Math.floor(hi)) {
			case 0:
				pure[0] = 1; pure[1] = v; pure[2] = 0; break;
			case 1:
				pure[0] = w; pure[1] = 1; pure[2] = 0; break;
			case 2:
				pure[0] = 0; pure[1] = 1; pure[2] = v; break;
			case 3:
				pure[0] = 0; pure[1] = w; pure[2] = 1; break;
			case 4:
				pure[0] = v; pure[1] = 0; pure[2] = 1; break;
			default:
				pure[0] = 1; pure[1] = 0; pure[2] = w;
		}
		/* eslint-enable max-statements-per-line */

		mg = (1.0 - c) * g;

		return [
			(c * pure[0] + mg) * 255,
			(c * pure[1] + mg) * 255,
			(c * pure[2] + mg) * 255
		];
	};

	convert.hcg.hsv = function (hcg) {
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;

		const v = c + g * (1.0 - c);
		let f = 0;

		if (v > 0.0) {
			f = c / v;
		}

		return [hcg[0], f * 100, v * 100];
	};

	convert.hcg.hsl = function (hcg) {
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;

		const l = g * (1.0 - c) + 0.5 * c;
		let s = 0;

		if (l > 0.0 && l < 0.5) {
			s = c / (2 * l);
		} else
		if (l >= 0.5 && l < 1.0) {
			s = c / (2 * (1 - l));
		}

		return [hcg[0], s * 100, l * 100];
	};

	convert.hcg.hwb = function (hcg) {
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;
		const v = c + g * (1.0 - c);
		return [hcg[0], (v - c) * 100, (1 - v) * 100];
	};

	convert.hwb.hcg = function (hwb) {
		const w = hwb[1] / 100;
		const b = hwb[2] / 100;
		const v = 1 - b;
		const c = v - w;
		let g = 0;

		if (c < 1) {
			g = (v - c) / (1 - c);
		}

		return [hwb[0], c * 100, g * 100];
	};

	convert.apple.rgb = function (apple) {
		return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
	};

	convert.rgb.apple = function (rgb) {
		return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
	};

	convert.gray.rgb = function (args) {
		return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
	};

	convert.gray.hsl = function (args) {
		return [0, 0, args[0]];
	};

	convert.gray.hsv = convert.gray.hsl;

	convert.gray.hwb = function (gray) {
		return [0, 100, gray[0]];
	};

	convert.gray.cmyk = function (gray) {
		return [0, 0, 0, gray[0]];
	};

	convert.gray.lab = function (gray) {
		return [gray[0], 0, 0];
	};

	convert.gray.hex = function (gray) {
		const val = Math.round(gray[0] / 100 * 255) & 0xFF;
		const integer = (val << 16) + (val << 8) + val;

		const string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert.rgb.gray = function (rgb) {
		const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
		return [val / 255 * 100];
	};
	return conversions;
}

var route;
var hasRequiredRoute;

function requireRoute () {
	if (hasRequiredRoute) return route;
	hasRequiredRoute = 1;
	const conversions = requireConversions();

	/*
		This function routes a model to all other models.

		all functions that are routed have a property `.conversion` attached
		to the returned synthetic function. This property is an array
		of strings, each with the steps in between the 'from' and 'to'
		color models (inclusive).

		conversions that are not possible simply are not included.
	*/

	function buildGraph() {
		const graph = {};
		// https://jsperf.com/object-keys-vs-for-in-with-closure/3
		const models = Object.keys(conversions);

		for (let len = models.length, i = 0; i < len; i++) {
			graph[models[i]] = {
				// http://jsperf.com/1-vs-infinity
				// micro-opt, but this is simple.
				distance: -1,
				parent: null
			};
		}

		return graph;
	}

	// https://en.wikipedia.org/wiki/Breadth-first_search
	function deriveBFS(fromModel) {
		const graph = buildGraph();
		const queue = [fromModel]; // Unshift -> queue -> pop

		graph[fromModel].distance = 0;

		while (queue.length) {
			const current = queue.pop();
			const adjacents = Object.keys(conversions[current]);

			for (let len = adjacents.length, i = 0; i < len; i++) {
				const adjacent = adjacents[i];
				const node = graph[adjacent];

				if (node.distance === -1) {
					node.distance = graph[current].distance + 1;
					node.parent = current;
					queue.unshift(adjacent);
				}
			}
		}

		return graph;
	}

	function link(from, to) {
		return function (args) {
			return to(from(args));
		};
	}

	function wrapConversion(toModel, graph) {
		const path = [graph[toModel].parent, toModel];
		let fn = conversions[graph[toModel].parent][toModel];

		let cur = graph[toModel].parent;
		while (graph[cur].parent) {
			path.unshift(graph[cur].parent);
			fn = link(conversions[graph[cur].parent][cur], fn);
			cur = graph[cur].parent;
		}

		fn.conversion = path;
		return fn;
	}

	route = function (fromModel) {
		const graph = deriveBFS(fromModel);
		const conversion = {};

		const models = Object.keys(graph);
		for (let len = models.length, i = 0; i < len; i++) {
			const toModel = models[i];
			const node = graph[toModel];

			if (node.parent === null) {
				// No possible conversion, or this node is the source model.
				continue;
			}

			conversion[toModel] = wrapConversion(toModel, graph);
		}

		return conversion;
	};
	return route;
}

var colorConvert;
var hasRequiredColorConvert;

function requireColorConvert () {
	if (hasRequiredColorConvert) return colorConvert;
	hasRequiredColorConvert = 1;
	const conversions = requireConversions();
	const route = requireRoute();

	const convert = {};

	const models = Object.keys(conversions);

	function wrapRaw(fn) {
		const wrappedFn = function (...args) {
			const arg0 = args[0];
			if (arg0 === undefined || arg0 === null) {
				return arg0;
			}

			if (arg0.length > 1) {
				args = arg0;
			}

			return fn(args);
		};

		// Preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	function wrapRounded(fn) {
		const wrappedFn = function (...args) {
			const arg0 = args[0];

			if (arg0 === undefined || arg0 === null) {
				return arg0;
			}

			if (arg0.length > 1) {
				args = arg0;
			}

			const result = fn(args);

			// We're assuming the result is an array here.
			// see notice in conversions.js; don't use box types
			// in conversion functions.
			if (typeof result === 'object') {
				for (let len = result.length, i = 0; i < len; i++) {
					result[i] = Math.round(result[i]);
				}
			}

			return result;
		};

		// Preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	models.forEach(fromModel => {
		convert[fromModel] = {};

		Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
		Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

		const routes = route(fromModel);
		const routeModels = Object.keys(routes);

		routeModels.forEach(toModel => {
			const fn = routes[toModel];

			convert[fromModel][toModel] = wrapRounded(fn);
			convert[fromModel][toModel].raw = wrapRaw(fn);
		});
	});

	colorConvert = convert;
	return colorConvert;
}

ansiStyles$1.exports;

(function (module) {

	const wrapAnsi16 = (fn, offset) => (...args) => {
		const code = fn(...args);
		return `\u001B[${code + offset}m`;
	};

	const wrapAnsi256 = (fn, offset) => (...args) => {
		const code = fn(...args);
		return `\u001B[${38 + offset};5;${code}m`;
	};

	const wrapAnsi16m = (fn, offset) => (...args) => {
		const rgb = fn(...args);
		return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
	};

	const ansi2ansi = n => n;
	const rgb2rgb = (r, g, b) => [r, g, b];

	const setLazyProperty = (object, property, get) => {
		Object.defineProperty(object, property, {
			get: () => {
				const value = get();

				Object.defineProperty(object, property, {
					value,
					enumerable: true,
					configurable: true
				});

				return value;
			},
			enumerable: true,
			configurable: true
		});
	};

	/** @type {typeof import('color-convert')} */
	let colorConvert;
	const makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
		if (colorConvert === undefined) {
			colorConvert = requireColorConvert();
		}

		const offset = isBackground ? 10 : 0;
		const styles = {};

		for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
			const name = sourceSpace === 'ansi16' ? 'ansi' : sourceSpace;
			if (sourceSpace === targetSpace) {
				styles[name] = wrap(identity, offset);
			} else if (typeof suite === 'object') {
				styles[name] = wrap(suite[targetSpace], offset);
			}
		}

		return styles;
	};

	function assembleStyles() {
		const codes = new Map();
		const styles = {
			modifier: {
				reset: [0, 0],
				// 21 isn't widely supported and 22 does the same thing
				bold: [1, 22],
				dim: [2, 22],
				italic: [3, 23],
				underline: [4, 24],
				inverse: [7, 27],
				hidden: [8, 28],
				strikethrough: [9, 29]
			},
			color: {
				black: [30, 39],
				red: [31, 39],
				green: [32, 39],
				yellow: [33, 39],
				blue: [34, 39],
				magenta: [35, 39],
				cyan: [36, 39],
				white: [37, 39],

				// Bright color
				blackBright: [90, 39],
				redBright: [91, 39],
				greenBright: [92, 39],
				yellowBright: [93, 39],
				blueBright: [94, 39],
				magentaBright: [95, 39],
				cyanBright: [96, 39],
				whiteBright: [97, 39]
			},
			bgColor: {
				bgBlack: [40, 49],
				bgRed: [41, 49],
				bgGreen: [42, 49],
				bgYellow: [43, 49],
				bgBlue: [44, 49],
				bgMagenta: [45, 49],
				bgCyan: [46, 49],
				bgWhite: [47, 49],

				// Bright color
				bgBlackBright: [100, 49],
				bgRedBright: [101, 49],
				bgGreenBright: [102, 49],
				bgYellowBright: [103, 49],
				bgBlueBright: [104, 49],
				bgMagentaBright: [105, 49],
				bgCyanBright: [106, 49],
				bgWhiteBright: [107, 49]
			}
		};

		// Alias bright black as gray (and grey)
		styles.color.gray = styles.color.blackBright;
		styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
		styles.color.grey = styles.color.blackBright;
		styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

		for (const [groupName, group] of Object.entries(styles)) {
			for (const [styleName, style] of Object.entries(group)) {
				styles[styleName] = {
					open: `\u001B[${style[0]}m`,
					close: `\u001B[${style[1]}m`
				};

				group[styleName] = styles[styleName];

				codes.set(style[0], style[1]);
			}

			Object.defineProperty(styles, groupName, {
				value: group,
				enumerable: false
			});
		}

		Object.defineProperty(styles, 'codes', {
			value: codes,
			enumerable: false
		});

		styles.color.close = '\u001B[39m';
		styles.bgColor.close = '\u001B[49m';

		setLazyProperty(styles.color, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, false));
		setLazyProperty(styles.color, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, false));
		setLazyProperty(styles.color, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, false));
		setLazyProperty(styles.bgColor, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, true));
		setLazyProperty(styles.bgColor, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, true));
		setLazyProperty(styles.bgColor, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, true));

		return styles;
	}

	// Make the export immutable
	Object.defineProperty(module, 'exports', {
		enumerable: true,
		get: assembleStyles
	}); 
} (ansiStyles$1));

var ansiStylesExports = ansiStyles$1.exports;

const stringWidth = stringWidthExports;
const stripAnsi = stripAnsi$2;
const ansiStyles = ansiStylesExports;

const ESCAPES = new Set([
	'\u001B',
	'\u009B'
]);

const END_CODE = 39;

const wrapAnsi = code => `${ESCAPES.values().next().value}[${code}m`;

// Calculate the length of words split on ' ', ignoring
// the extra characters added by ansi escape codes
const wordLengths = string => string.split(' ').map(character => stringWidth(character));

// Wrap a long word across multiple rows
// Ansi escape codes do not count towards length
const wrapWord = (rows, word, columns) => {
	const characters = [...word];

	let isInsideEscape = false;
	let visible = stringWidth(stripAnsi(rows[rows.length - 1]));

	for (const [index, character] of characters.entries()) {
		const characterLength = stringWidth(character);

		if (visible + characterLength <= columns) {
			rows[rows.length - 1] += character;
		} else {
			rows.push(character);
			visible = 0;
		}

		if (ESCAPES.has(character)) {
			isInsideEscape = true;
		} else if (isInsideEscape && character === 'm') {
			isInsideEscape = false;
			continue;
		}

		if (isInsideEscape) {
			continue;
		}

		visible += characterLength;

		if (visible === columns && index < characters.length - 1) {
			rows.push('');
			visible = 0;
		}
	}

	// It's possible that the last row we copy over is only
	// ansi escape characters, handle this edge-case
	if (!visible && rows[rows.length - 1].length > 0 && rows.length > 1) {
		rows[rows.length - 2] += rows.pop();
	}
};

// Trims spaces from a string ignoring invisible sequences
const stringVisibleTrimSpacesRight = str => {
	const words = str.split(' ');
	let last = words.length;

	while (last > 0) {
		if (stringWidth(words[last - 1]) > 0) {
			break;
		}

		last--;
	}

	if (last === words.length) {
		return str;
	}

	return words.slice(0, last).join(' ') + words.slice(last).join('');
};

// The wrap-ansi module can be invoked in either 'hard' or 'soft' wrap mode
//
// 'hard' will never allow a string to take up more than columns characters
//
// 'soft' allows long words to expand past the column length
const exec = (string, columns, options = {}) => {
	if (options.trim !== false && string.trim() === '') {
		return '';
	}

	let pre = '';
	let ret = '';
	let escapeCode;

	const lengths = wordLengths(string);
	let rows = [''];

	for (const [index, word] of string.split(' ').entries()) {
		if (options.trim !== false) {
			rows[rows.length - 1] = rows[rows.length - 1].trimLeft();
		}

		let rowLength = stringWidth(rows[rows.length - 1]);

		if (index !== 0) {
			if (rowLength >= columns && (options.wordWrap === false || options.trim === false)) {
				// If we start with a new word but the current row length equals the length of the columns, add a new row
				rows.push('');
				rowLength = 0;
			}

			if (rowLength > 0 || options.trim === false) {
				rows[rows.length - 1] += ' ';
				rowLength++;
			}
		}

		// In 'hard' wrap mode, the length of a line is never allowed to extend past 'columns'
		if (options.hard && lengths[index] > columns) {
			const remainingColumns = (columns - rowLength);
			const breaksStartingThisLine = 1 + Math.floor((lengths[index] - remainingColumns - 1) / columns);
			const breaksStartingNextLine = Math.floor((lengths[index] - 1) / columns);
			if (breaksStartingNextLine < breaksStartingThisLine) {
				rows.push('');
			}

			wrapWord(rows, word, columns);
			continue;
		}

		if (rowLength + lengths[index] > columns && rowLength > 0 && lengths[index] > 0) {
			if (options.wordWrap === false && rowLength < columns) {
				wrapWord(rows, word, columns);
				continue;
			}

			rows.push('');
		}

		if (rowLength + lengths[index] > columns && options.wordWrap === false) {
			wrapWord(rows, word, columns);
			continue;
		}

		rows[rows.length - 1] += word;
	}

	if (options.trim !== false) {
		rows = rows.map(stringVisibleTrimSpacesRight);
	}

	pre = rows.join('\n');

	for (const [index, character] of [...pre].entries()) {
		ret += character;

		if (ESCAPES.has(character)) {
			const code = parseFloat(/\d[^m]*/.exec(pre.slice(index, index + 4)));
			escapeCode = code === END_CODE ? null : code;
		}

		const code = ansiStyles.codes.get(Number(escapeCode));

		if (escapeCode && code) {
			if (pre[index + 1] === '\n') {
				ret += wrapAnsi(code);
			} else if (character === '\n') {
				ret += wrapAnsi(escapeCode);
			}
		}
	}

	return ret;
};

// For each newline, invoke the method separately
var wrapAnsi_1 = (string, columns, options) => {
	return String(string)
		.normalize()
		.replace(/\r\n/g, '\n')
		.split('\n')
		.map(line => exec(line, columns, options))
		.join('\n');
};

var wrapAnsi$1 = /*@__PURE__*/getDefaultExportFromCjs(wrapAnsi_1);

/**
 * Force line returns at specific width. This function is ANSI code friendly and it'll
 * ignore invisible codes during width calculation.
 * @param {string} content
 * @param {number} width
 * @return {string}
 */
function breakLines(content, width) {
    return content
        .split('\n')
        .flatMap((line) => wrapAnsi$1(line, width, { trim: false, hard: true })
        .split('\n')
        .map((str) => str.trimEnd()))
        .join('\n');
}
/**
 * Returns the width of the active readline, or 80 as default value.
 * @returns {number}
 */
function readlineWidth() {
    return cliWidth$1({ defaultWidth: 80, output: readline().output });
}

class CancelablePromise extends Promise {
    cancel = () => { };
}

const Stream = require$$0$5;

class MuteStream extends Stream {
  #isTTY = null

  constructor (opts = {}) {
    super(opts);
    this.writable = this.readable = true;
    this.muted = false;
    this.on('pipe', this._onpipe);
    this.replace = opts.replace;

    // For readline-type situations
    // This much at the start of a line being redrawn after a ctrl char
    // is seen (such as backspace) won't be redrawn as the replacement
    this._prompt = opts.prompt || null;
    this._hadControl = false;
  }

  #destSrc (key, def) {
    if (this._dest) {
      return this._dest[key]
    }
    if (this._src) {
      return this._src[key]
    }
    return def
  }

  #proxy (method, ...args) {
    if (typeof this._dest?.[method] === 'function') {
      this._dest[method](...args);
    }
    if (typeof this._src?.[method] === 'function') {
      this._src[method](...args);
    }
  }

  get isTTY () {
    if (this.#isTTY !== null) {
      return this.#isTTY
    }
    return this.#destSrc('isTTY', false)
  }

  // basically just get replace the getter/setter with a regular value
  set isTTY (val) {
    this.#isTTY = val;
  }

  get rows () {
    return this.#destSrc('rows')
  }

  get columns () {
    return this.#destSrc('columns')
  }

  mute () {
    this.muted = true;
  }

  unmute () {
    this.muted = false;
  }

  _onpipe (src) {
    this._src = src;
  }

  pipe (dest, options) {
    this._dest = dest;
    return super.pipe(dest, options)
  }

  pause () {
    if (this._src) {
      return this._src.pause()
    }
  }

  resume () {
    if (this._src) {
      return this._src.resume()
    }
  }

  write (c) {
    if (this.muted) {
      if (!this.replace) {
        return true
      }
      // eslint-disable-next-line no-control-regex
      if (c.match(/^\u001b/)) {
        if (c.indexOf(this._prompt) === 0) {
          c = c.slice(this._prompt.length);
          c = c.replace(/./g, this.replace);
          c = this._prompt + c;
        }
        this._hadControl = true;
        return this.emit('data', c)
      } else {
        if (this._prompt && this._hadControl &&
          c.indexOf(this._prompt) === 0) {
          this._hadControl = false;
          this.emit('data', this._prompt);
          c = c.slice(this._prompt.length);
        }
        c = c.toString().replace(/./g, this.replace);
      }
    }
    this.emit('data', c);
  }

  end (c) {
    if (this.muted) {
      if (c && this.replace) {
        c = c.toString().replace(/./g, this.replace);
      } else {
        c = null;
      }
    }
    if (c) {
      this.emit('data', c);
    }
    this.emit('end');
  }

  destroy (...args) {
    return this.#proxy('destroy', ...args)
  }

  destroySoon (...args) {
    return this.#proxy('destroySoon', ...args)
  }

  close (...args) {
    return this.#proxy('close', ...args)
  }
}

var lib = MuteStream;

var MuteStream$1 = /*@__PURE__*/getDefaultExportFromCjs(lib);

/**
 * This is not the set of all possible signals.
 *
 * It IS, however, the set of all signals that trigger
 * an exit on either Linux or BSD systems.  Linux is a
 * superset of the signal names supported on BSD, and
 * the unknown signals just fail to register, so we can
 * catch that easily enough.
 *
 * Windows signals are a different set, since there are
 * signals that terminate Windows processes, but don't
 * terminate (or don't even exist) on Posix systems.
 *
 * Don't bother with SIGKILL.  It's uncatchable, which
 * means that we can't fire any callbacks anyway.
 *
 * If a user does happen to register a handler on a non-
 * fatal signal like SIGWINCH or something, and then
 * exit, it'll end up firing `process.emit('exit')`, so
 * the handler will be fired anyway.
 *
 * SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
 * artificially, inherently leave the process in a
 * state from which it is not safe to try and enter JS
 * listeners.
 */
const signals = [];
signals.push('SIGHUP', 'SIGINT', 'SIGTERM');
if (process.platform !== 'win32') {
    signals.push('SIGALRM', 'SIGABRT', 'SIGVTALRM', 'SIGXCPU', 'SIGXFSZ', 'SIGUSR2', 'SIGTRAP', 'SIGSYS', 'SIGQUIT', 'SIGIOT'
    // should detect profiler and enable/disable accordingly.
    // see #21
    // 'SIGPROF'
    );
}
if (process.platform === 'linux') {
    signals.push('SIGIO', 'SIGPOLL', 'SIGPWR', 'SIGSTKFLT');
}

// Note: since nyc uses this module to output coverage, any lines
// that are in the direct sync flow of nyc's outputCoverage are
// ignored, since we can never get coverage for them.
// grab a reference to node's real process object right away
const processOk = (process) => !!process &&
    typeof process === 'object' &&
    typeof process.removeListener === 'function' &&
    typeof process.emit === 'function' &&
    typeof process.reallyExit === 'function' &&
    typeof process.listeners === 'function' &&
    typeof process.kill === 'function' &&
    typeof process.pid === 'number' &&
    typeof process.on === 'function';
const kExitEmitter = Symbol.for('signal-exit emitter');
const global$1 = globalThis;
const ObjectDefineProperty = Object.defineProperty.bind(Object);
// teeny special purpose ee
class Emitter {
    emitted = {
        afterExit: false,
        exit: false,
    };
    listeners = {
        afterExit: [],
        exit: [],
    };
    count = 0;
    id = Math.random();
    constructor() {
        if (global$1[kExitEmitter]) {
            return global$1[kExitEmitter];
        }
        ObjectDefineProperty(global$1, kExitEmitter, {
            value: this,
            writable: false,
            enumerable: false,
            configurable: false,
        });
    }
    on(ev, fn) {
        this.listeners[ev].push(fn);
    }
    removeListener(ev, fn) {
        const list = this.listeners[ev];
        const i = list.indexOf(fn);
        /* c8 ignore start */
        if (i === -1) {
            return;
        }
        /* c8 ignore stop */
        if (i === 0 && list.length === 1) {
            list.length = 0;
        }
        else {
            list.splice(i, 1);
        }
    }
    emit(ev, code, signal) {
        if (this.emitted[ev]) {
            return false;
        }
        this.emitted[ev] = true;
        let ret = false;
        for (const fn of this.listeners[ev]) {
            ret = fn(code, signal) === true || ret;
        }
        if (ev === 'exit') {
            ret = this.emit('afterExit', code, signal) || ret;
        }
        return ret;
    }
}
class SignalExitBase {
}
const signalExitWrap = (handler) => {
    return {
        onExit(cb, opts) {
            return handler.onExit(cb, opts);
        },
        load() {
            return handler.load();
        },
        unload() {
            return handler.unload();
        },
    };
};
class SignalExitFallback extends SignalExitBase {
    onExit() {
        return () => { };
    }
    load() { }
    unload() { }
}
class SignalExit extends SignalExitBase {
    // "SIGHUP" throws an `ENOSYS` error on Windows,
    // so use a supported signal instead
    /* c8 ignore start */
    #hupSig = process$1.platform === 'win32' ? 'SIGINT' : 'SIGHUP';
    /* c8 ignore stop */
    #emitter = new Emitter();
    #process;
    #originalProcessEmit;
    #originalProcessReallyExit;
    #sigListeners = {};
    #loaded = false;
    constructor(process) {
        super();
        this.#process = process;
        // { <signal>: <listener fn>, ... }
        this.#sigListeners = {};
        for (const sig of signals) {
            this.#sigListeners[sig] = () => {
                // If there are no other listeners, an exit is coming!
                // Simplest way: remove us and then re-send the signal.
                // We know that this will kill the process, so we can
                // safely emit now.
                const listeners = this.#process.listeners(sig);
                let { count } = this.#emitter;
                // This is a workaround for the fact that signal-exit v3 and signal
                // exit v4 are not aware of each other, and each will attempt to let
                // the other handle it, so neither of them do. To correct this, we
                // detect if we're the only handler *except* for previous versions
                // of signal-exit, and increment by the count of listeners it has
                // created.
                /* c8 ignore start */
                const p = process;
                if (typeof p.__signal_exit_emitter__ === 'object' &&
                    typeof p.__signal_exit_emitter__.count === 'number') {
                    count += p.__signal_exit_emitter__.count;
                }
                /* c8 ignore stop */
                if (listeners.length === count) {
                    this.unload();
                    const ret = this.#emitter.emit('exit', null, sig);
                    /* c8 ignore start */
                    const s = sig === 'SIGHUP' ? this.#hupSig : sig;
                    if (!ret)
                        process.kill(process.pid, s);
                    /* c8 ignore stop */
                }
            };
        }
        this.#originalProcessReallyExit = process.reallyExit;
        this.#originalProcessEmit = process.emit;
    }
    onExit(cb, opts) {
        /* c8 ignore start */
        if (!processOk(this.#process)) {
            return () => { };
        }
        /* c8 ignore stop */
        if (this.#loaded === false) {
            this.load();
        }
        const ev = opts?.alwaysLast ? 'afterExit' : 'exit';
        this.#emitter.on(ev, cb);
        return () => {
            this.#emitter.removeListener(ev, cb);
            if (this.#emitter.listeners['exit'].length === 0 &&
                this.#emitter.listeners['afterExit'].length === 0) {
                this.unload();
            }
        };
    }
    load() {
        if (this.#loaded) {
            return;
        }
        this.#loaded = true;
        // This is the number of onSignalExit's that are in play.
        // It's important so that we can count the correct number of
        // listeners on signals, and don't wait for the other one to
        // handle it instead of us.
        this.#emitter.count += 1;
        for (const sig of signals) {
            try {
                const fn = this.#sigListeners[sig];
                if (fn)
                    this.#process.on(sig, fn);
            }
            catch (_) { }
        }
        this.#process.emit = (ev, ...a) => {
            return this.#processEmit(ev, ...a);
        };
        this.#process.reallyExit = (code) => {
            return this.#processReallyExit(code);
        };
    }
    unload() {
        if (!this.#loaded) {
            return;
        }
        this.#loaded = false;
        signals.forEach(sig => {
            const listener = this.#sigListeners[sig];
            /* c8 ignore start */
            if (!listener) {
                throw new Error('Listener not defined for signal: ' + sig);
            }
            /* c8 ignore stop */
            try {
                this.#process.removeListener(sig, listener);
                /* c8 ignore start */
            }
            catch (_) { }
            /* c8 ignore stop */
        });
        this.#process.emit = this.#originalProcessEmit;
        this.#process.reallyExit = this.#originalProcessReallyExit;
        this.#emitter.count -= 1;
    }
    #processReallyExit(code) {
        /* c8 ignore start */
        if (!processOk(this.#process)) {
            return 0;
        }
        this.#process.exitCode = code || 0;
        /* c8 ignore stop */
        this.#emitter.emit('exit', this.#process.exitCode, null);
        return this.#originalProcessReallyExit.call(this.#process, this.#process.exitCode);
    }
    #processEmit(ev, ...args) {
        const og = this.#originalProcessEmit;
        if (ev === 'exit' && processOk(this.#process)) {
            if (typeof args[0] === 'number') {
                this.#process.exitCode = args[0];
                /* c8 ignore start */
            }
            /* c8 ignore start */
            const ret = og.call(this.#process, ev, ...args);
            /* c8 ignore start */
            this.#emitter.emit('exit', this.#process.exitCode, null);
            /* c8 ignore stop */
            return ret;
        }
        else {
            return og.call(this.#process, ev, ...args);
        }
    }
}
const process$1 = globalThis.process;
// wrap so that we call the method on the actual handler, without
// exporting it directly.
const { 
/**
 * Called when the process is exiting, whether via signal, explicit
 * exit, or running out of stuff to do.
 *
 * If the global process object is not suitable for instrumentation,
 * then this will be a no-op.
 *
 * Returns a function that may be used to unload signal-exit.
 */
onExit, 
/**
 * Load the listeners.  Likely you never need to call this, unless
 * doing a rather deep integration with signal-exit functionality.
 * Mostly exposed for the benefit of testing.
 *
 * @internal
 */
load, 
/**
 * Unload the listeners.  Likely you never need to call this, unless
 * doing a rather deep integration with signal-exit functionality.
 * Mostly exposed for the benefit of testing.
 *
 * @internal
 */
unload, } = signalExitWrap(processOk(process$1) ? new SignalExit(process$1) : new SignalExitFallback());

var ansiEscapes$1 = {exports: {}};

(function (module) {
	const ansiEscapes = module.exports;
	// TODO: remove this in the next major version
	module.exports.default = ansiEscapes;

	const ESC = '\u001B[';
	const OSC = '\u001B]';
	const BEL = '\u0007';
	const SEP = ';';
	const isTerminalApp = process.env.TERM_PROGRAM === 'Apple_Terminal';

	ansiEscapes.cursorTo = (x, y) => {
		if (typeof x !== 'number') {
			throw new TypeError('The `x` argument is required');
		}

		if (typeof y !== 'number') {
			return ESC + (x + 1) + 'G';
		}

		return ESC + (y + 1) + ';' + (x + 1) + 'H';
	};

	ansiEscapes.cursorMove = (x, y) => {
		if (typeof x !== 'number') {
			throw new TypeError('The `x` argument is required');
		}

		let ret = '';

		if (x < 0) {
			ret += ESC + (-x) + 'D';
		} else if (x > 0) {
			ret += ESC + x + 'C';
		}

		if (y < 0) {
			ret += ESC + (-y) + 'A';
		} else if (y > 0) {
			ret += ESC + y + 'B';
		}

		return ret;
	};

	ansiEscapes.cursorUp = (count = 1) => ESC + count + 'A';
	ansiEscapes.cursorDown = (count = 1) => ESC + count + 'B';
	ansiEscapes.cursorForward = (count = 1) => ESC + count + 'C';
	ansiEscapes.cursorBackward = (count = 1) => ESC + count + 'D';

	ansiEscapes.cursorLeft = ESC + 'G';
	ansiEscapes.cursorSavePosition = isTerminalApp ? '\u001B7' : ESC + 's';
	ansiEscapes.cursorRestorePosition = isTerminalApp ? '\u001B8' : ESC + 'u';
	ansiEscapes.cursorGetPosition = ESC + '6n';
	ansiEscapes.cursorNextLine = ESC + 'E';
	ansiEscapes.cursorPrevLine = ESC + 'F';
	ansiEscapes.cursorHide = ESC + '?25l';
	ansiEscapes.cursorShow = ESC + '?25h';

	ansiEscapes.eraseLines = count => {
		let clear = '';

		for (let i = 0; i < count; i++) {
			clear += ansiEscapes.eraseLine + (i < count - 1 ? ansiEscapes.cursorUp() : '');
		}

		if (count) {
			clear += ansiEscapes.cursorLeft;
		}

		return clear;
	};

	ansiEscapes.eraseEndLine = ESC + 'K';
	ansiEscapes.eraseStartLine = ESC + '1K';
	ansiEscapes.eraseLine = ESC + '2K';
	ansiEscapes.eraseDown = ESC + 'J';
	ansiEscapes.eraseUp = ESC + '1J';
	ansiEscapes.eraseScreen = ESC + '2J';
	ansiEscapes.scrollUp = ESC + 'S';
	ansiEscapes.scrollDown = ESC + 'T';

	ansiEscapes.clearScreen = '\u001Bc';

	ansiEscapes.clearTerminal = process.platform === 'win32' ?
		`${ansiEscapes.eraseScreen}${ESC}0f` :
		// 1. Erases the screen (Only done in case `2` is not supported)
		// 2. Erases the whole screen including scrollback buffer
		// 3. Moves cursor to the top-left position
		// More info: https://www.real-world-systems.com/docs/ANSIcode.html
		`${ansiEscapes.eraseScreen}${ESC}3J${ESC}H`;

	ansiEscapes.beep = BEL;

	ansiEscapes.link = (text, url) => {
		return [
			OSC,
			'8',
			SEP,
			SEP,
			url,
			BEL,
			text,
			OSC,
			'8',
			SEP,
			SEP,
			BEL
		].join('');
	};

	ansiEscapes.image = (buffer, options = {}) => {
		let ret = `${OSC}1337;File=inline=1`;

		if (options.width) {
			ret += `;width=${options.width}`;
		}

		if (options.height) {
			ret += `;height=${options.height}`;
		}

		if (options.preserveAspectRatio === false) {
			ret += ';preserveAspectRatio=0';
		}

		return ret + ':' + buffer.toString('base64') + BEL;
	};

	ansiEscapes.iTerm = {
		setCwd: (cwd = process.cwd()) => `${OSC}50;CurrentDir=${cwd}${BEL}`,

		annotation: (message, options = {}) => {
			let ret = `${OSC}1337;`;

			const hasX = typeof options.x !== 'undefined';
			const hasY = typeof options.y !== 'undefined';
			if ((hasX || hasY) && !(hasX && hasY && typeof options.length !== 'undefined')) {
				throw new Error('`x`, `y` and `length` must be defined when `x` or `y` is defined');
			}

			message = message.replace(/\|/g, '');

			ret += options.isHidden ? 'AddHiddenAnnotation=' : 'AddAnnotation=';

			if (options.length > 0) {
				ret +=
						(hasX ?
							[message, options.length, options.x, options.y] :
							[options.length, message]).join('|');
			} else {
				ret += message;
			}

			return ret + BEL;
		}
	}; 
} (ansiEscapes$1));

var ansiEscapesExports = ansiEscapes$1.exports;
var ansiEscapes = /*@__PURE__*/getDefaultExportFromCjs(ansiEscapesExports);

const height = (content) => content.split('\n').length;
const lastLine = (content) => content.split('\n').pop() ?? '';
function cursorDown(n) {
    return n > 0 ? ansiEscapes.cursorDown(n) : '';
}
class ScreenManager {
    rl;
    // These variables are keeping information to allow correct prompt re-rendering
    height = 0;
    extraLinesUnderPrompt = 0;
    cursorPos;
    constructor(rl) {
        this.rl = rl;
        this.rl = rl;
        this.cursorPos = rl.getCursorPos();
    }
    write(content) {
        this.rl.output.unmute();
        this.rl.output.write(content);
        this.rl.output.mute();
    }
    render(content, bottomContent = '') {
        // Write message to screen and setPrompt to control backspace
        const promptLine = lastLine(content);
        const rawPromptLine = stripAnsi$3(promptLine);
        // Remove the rl.line from our prompt. We can't rely on the content of
        // rl.line (mainly because of the password prompt), so just rely on it's
        // length.
        let prompt = rawPromptLine;
        if (this.rl.line.length > 0) {
            prompt = prompt.slice(0, -this.rl.line.length);
        }
        this.rl.setPrompt(prompt);
        // SetPrompt will change cursor position, now we can get correct value
        this.cursorPos = this.rl.getCursorPos();
        const width = readlineWidth();
        content = breakLines(content, width);
        bottomContent = breakLines(bottomContent, width);
        // Manually insert an extra line if we're at the end of the line.
        // This prevent the cursor from appearing at the beginning of the
        // current line.
        if (rawPromptLine.length % width === 0) {
            content += '\n';
        }
        let output = content + (bottomContent ? '\n' + bottomContent : '');
        /**
         * Re-adjust the cursor at the correct position.
         */
        // We need to consider parts of the prompt under the cursor as part of the bottom
        // content in order to correctly cleanup and re-render.
        const promptLineUpDiff = Math.floor(rawPromptLine.length / width) - this.cursorPos.rows;
        const bottomContentHeight = promptLineUpDiff + (bottomContent ? height(bottomContent) : 0);
        // Return cursor to the input position (on top of the bottomContent)
        if (bottomContentHeight > 0)
            output += ansiEscapes.cursorUp(bottomContentHeight);
        // Return cursor to the initial left offset.
        output += ansiEscapes.cursorTo(this.cursorPos.cols);
        /**
         * Render and store state for future re-rendering
         */
        this.write(cursorDown(this.extraLinesUnderPrompt) +
            ansiEscapes.eraseLines(this.height) +
            output);
        this.extraLinesUnderPrompt = bottomContentHeight;
        this.height = height(output);
    }
    checkCursorPos() {
        const cursorPos = this.rl.getCursorPos();
        if (cursorPos.cols !== this.cursorPos.cols) {
            this.write(ansiEscapes.cursorTo(cursorPos.cols));
            this.cursorPos = cursorPos;
        }
    }
    done({ clearContent }) {
        this.rl.setPrompt('');
        let output = cursorDown(this.extraLinesUnderPrompt);
        output += clearContent ? ansiEscapes.eraseLines(this.height) : '\n';
        output += ansiEscapes.cursorShow;
        this.write(output);
        this.rl.close();
    }
}

function createPrompt(view) {
    const prompt = (config, context) => {
        // Default `input` to stdin
        const input = context?.input ?? process.stdin;
        // Add mute capabilities to the output
        const output = new MuteStream$1();
        output.pipe(context?.output ?? process.stdout);
        const rl = readline$1.createInterface({
            terminal: true,
            input,
            output,
        });
        const screen = new ScreenManager(rl);
        let cancel = () => { };
        const answer = new CancelablePromise((resolve, reject) => {
            withHooks(rl, (cycle) => {
                function checkCursorPos() {
                    screen.checkCursorPos();
                }
                const removeExitListener = onExit((code, signal) => {
                    onExit$1();
                    reject(new ExitPromptError(`User force closed the prompt with ${code} ${signal}`));
                });
                const hooksCleanup = AsyncResource.bind(() => {
                    try {
                        effectScheduler.clearAll();
                    }
                    catch (error) {
                        reject(error);
                    }
                });
                function onExit$1() {
                    hooksCleanup();
                    screen.done({ clearContent: Boolean(context?.clearPromptOnDone) });
                    removeExitListener();
                    rl.input.removeListener('keypress', checkCursorPos);
                    rl.removeListener('close', hooksCleanup);
                    output.end();
                }
                cancel = () => {
                    onExit$1();
                    reject(new CancelPromptError());
                };
                function done(value) {
                    // Delay execution to let time to the hookCleanup functions to registers.
                    setImmediate(() => {
                        onExit$1();
                        // Finally we resolve our promise
                        resolve(value);
                    });
                }
                cycle(() => {
                    try {
                        const nextView = view(config, done);
                        const [content, bottomContent] = typeof nextView === 'string' ? [nextView] : nextView;
                        screen.render(content, bottomContent);
                        effectScheduler.run();
                    }
                    catch (error) {
                        onExit$1();
                        reject(error);
                    }
                });
                // Re-renders only happen when the state change; but the readline cursor could change position
                // and that also requires a re-render (and a manual one because we mute the streams).
                // We set the listener after the initial workLoop to avoid a double render if render triggered
                // by a state change sets the cursor to the right position.
                rl.input.on('keypress', checkCursorPos);
                // The close event triggers immediately when the user press ctrl+c. SignalExit on the other hand
                // triggers after the process is done (which happens after timeouts are done triggering.)
                // We triggers the hooks cleanup phase on rl `close` so active timeouts can be cleared.
                rl.on('close', hooksCleanup);
            });
        });
        answer.cancel = cancel;
        return answer;
    };
    return prompt;
}

var input = createPrompt((config, done) => {
    const { required, validate = () => true } = config;
    const theme = makeTheme(config.theme);
    const [status, setStatus] = useState('pending');
    const [defaultValue = '', setDefaultValue] = useState(config.default);
    const [errorMsg, setError] = useState();
    const [value, setValue] = useState('');
    const isLoading = status === 'loading';
    const prefix = usePrefix({ isLoading, theme });
    useKeypress(async (key, rl) => {
        // Ignore keypress while our prompt is doing other processing.
        if (status !== 'pending') {
            return;
        }
        if (isEnterKey(key)) {
            const answer = value || defaultValue;
            setStatus('loading');
            const isValid = required && !answer ? 'You must provide a value' : await validate(answer);
            if (isValid === true) {
                setValue(answer);
                setStatus('done');
                done(answer);
            }
            else {
                // Reset the readline line value to the previous value. On line event, the value
                // get cleared, forcing the user to re-enter the value instead of fixing it.
                rl.write(value);
                setError(isValid || 'You must provide a valid value');
                setStatus('pending');
            }
        }
        else if (isBackspaceKey(key) && !value) {
            setDefaultValue(undefined);
        }
        else if (key.name === 'tab' && !value) {
            setDefaultValue(undefined);
            rl.clearLine(0); // Remove the tab character.
            rl.write(defaultValue);
            setValue(defaultValue);
        }
        else {
            setValue(rl.line);
            setError(undefined);
        }
    });
    const message = theme.style.message(config.message);
    let formattedValue = value;
    if (typeof config.transformer === 'function') {
        formattedValue = config.transformer(value, { isFinal: status === 'done' });
    }
    else if (status === 'done') {
        formattedValue = theme.style.answer(value);
    }
    let defaultStr;
    if (defaultValue && status !== 'done' && !value) {
        defaultStr = theme.style.defaultAnswer(defaultValue);
    }
    let error = '';
    if (errorMsg) {
        error = theme.style.error(errorMsg);
    }
    return [
        [prefix, message, defaultStr, formattedValue]
            .filter((v) => v !== undefined)
            .join(' '),
        error,
    ];
});

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol */


typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

program
    .option('-d, --debug', 'output extra debugging')
    .option('-s, --small', 'small pizza size')
    .option('-p, --pizza-type <type>', 'flavour of pizza');
// program.version('0.0.2');
const dirName = await input({ message: 'Enter your dirName', required: true });
console.log('dirName', dirName);
download$1('QingHeSite/browser-custom', dirName, {}, (err) => {
    console.log('download', err);
});
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
if (options.debug)
    console.log(options);
if (options.small)
    console.log('- small pizza size');
if (options.pizzaType)
    console.log(`- ${options.pizzaType}`);
// console.log('脚手架运行!')
