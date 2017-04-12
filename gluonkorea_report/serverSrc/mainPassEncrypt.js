const commandLineArgs = require('command-line-args');
const getUsage = require('command-line-usage');
const PassEncrypt = require('./PassEncrypt');

function main() {
    const optionDefinitions = [
        {
            name: 'encrypt',
            alias: 'e',
            type: String,
            multiple: true,
            defaultOption: true,
            typeLabel: '[underline]{encryptData}',
            description: 'encrypt data'
        },
        {
            name: 'decrypt',
            alias: 'd',
            type: String,
            multiple: true,
            typeLabel: '[underline]{decryptData}',
            description: 'decrypt data [red]'
        },
        {
            name: 'help',
            alias: 'h',
            type: Boolean,
            description: 'Print this usage guide'
        }
    ];

    const usage = [
        {
            header: 'Text En(De)cryption Convert Tool.',
            content: 'This tool is convert of text to encrypt or decrypt.'
        },
        {
            header: 'Example',
            content: [
                '$ node PassEncrypt.js [bold]{-e} [undeline]{ORIGNAL_TEXT}',
                '$ node PassEncrypt.js [bold]{-d} [undeline]{ENCODE_TEXT}'
            ]
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        }
    ];

    try {
        const options = commandLineArgs(optionDefinitions);

        if (options.encrypt) {
            if (Array.isArray(options.encrypt)) {
                for (let item of options.encrypt) {
                    console.log(PassEncrypt.encrypt(item));
                }
            } else {
                console.log(PassEncrypt.encrypt(options.encode));
            }
        } else if (options.decrypt) {
            if (Array.isArray(options.decrypt)) {
                for (let item of options.decrypt) {
                    console.log( PassEncrypt.decrypt(item));
                }
            } else {
                console.log( PassEncrypt.decrypt(options.decrypt) );
            }
        } else {
            console.log( getUsage(usage) );
        }
    } catch( e ) {
        console.error( e );
        console.log( getUsage(usage) );
    }
}

main();