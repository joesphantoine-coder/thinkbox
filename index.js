import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import readline from 'readline';
import fs from 'fs';
import chalk from 'chalk';

dotenv.config();

console.log("Current directory:", process.cwd());
console.log("API KEY:", process.env.GROQ_API_KEY);

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

const conversationHistory = [];

const SYSTEM_PROMPT = `You are ThinkBox, a sharp and direct AI assistant.
You remember everything said in this conversation.
You give clear, practical answers without unnecessary padding.
When asked for a thinking summary, analyze the full conversation and provide:
1. Main topics discussed
2. Key decisions or conclusions reached  
3. Action items or next steps mentioned
4. One insight the user might have missed`;

async function chat(userMessage) {
    conversationHistory.push({
        role: 'user',
        content: userMessage
    });

    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...conversationHistory
            ],
            temperature: 0.7,
            max_tokens: 1024
        });

        const assistantMessage = response.choices[0].message.content;

        conversationHistory.push({
            role: 'assistant',
            content: assistantMessage
        });

        return assistantMessage;
    } catch (error) {
        throw new Error(`API Error: ${error.message}`)
    }

}


function saveConversation() {
    const now = new Date();
    const filename = `chat-${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}-${now.getHours()}${now.getMinutes()}.txt`

    let content = `ThinkBox conversation\n`;
    content += `Date: ${now.toLocaleString()}\n`;
    content += `${'='.repeat(50)}\n\n`;

    conversationHistory.forEach(msg => {
        if (msg.role === 'user') {
            content += `YOU: ${msg.content}\n\n`;
        } else {
            content += `THINKBOX: ${msg.content}\n\n`;
            content += `${'-'.repeat(30)}\n\n`;
        }
    })

    fs.writeFileSync(filename, content);
    return filename;
}


async function thinkingSummary() {
    if (conversationHistory.length === 0) {
        return 'No conversation to summarize yet.';
    }

    const summaryResponse = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...conversationHistory,
            {
                role: 'user',
                content: 'Please give me a thinking summary of our entire conversation following your summary format.'
            }
        ],
        temperature: 0.5,
        max_tokens: 800
    });
    return summaryResponse.choices[0].message.content;
}


function showWelcome() {
  console.log(chalk.cyan('\n╔════════════════════════════════╗'));
  console.log(chalk.cyan('║     ThinkBox — Your AI Brain   ║'));
  console.log(chalk.cyan('╚════════════════════════════════╝'));
  console.log(chalk.gray('\nCommands:'));
  console.log(chalk.yellow('  /save') + chalk.gray('    — save conversation to file'));
  console.log(chalk.yellow('  /summary') + chalk.gray(' — get AI thinking summary'));
  console.log(chalk.yellow('  /clear') + chalk.gray('   — clear conversation history'));
  console.log(chalk.yellow('  /exit') + chalk.gray('    — quit ThinkBox'));
  console.log(chalk.gray('\nType anything else to chat.\n'));
}


async function main() {
    showWelcome();

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const askQuestion = () => {
        rl.question(chalk.green('\nYou:  '), async (input) => {
            const userInput = input.trim();

            if (!userInput) {
                askQuestion();
                return;
            }

            if (userInput === '/exit') {
                console.log(chalk.cyan('\nThinkBox: Goodbye. keep building.\n'))
                rl.close();
                return;
            }

            if (userInput === '/clear') {
                conversationHistory.length = 0;
                console.log(chalk.yellow('\nConversation cleared. Fresh start.\n'))
                askQuestion();
                return;
            }


            if (userInput === '/save') {
                if (conversationHistory.length === 0) {
                    console.log(chalk.red('\nNothing to save yet.\n'))
                } else {
                    const filename = saveConversation();
                    console.log(chalk.green(`\nSaved to: ${filename}\n`))
                }
                askQuestion()
                return
            }

            if (userInput === '/summary') {
                console.log(chalk.cyan('\nTHinkBox is analyzing your session...\n'))
                try {
                    const summary = await getThinkingSummary();
                    console.log(chalk.magenta('\n📊 THINKING SUMMARY'));
                    console.log(chalk.gray('-'.repeat(40)));
                    console.log(chalk.white(summary));
                    console.log(chalk.gray('-'.repeat(40) + '\n'))
                } catch (error) {
                    console.log(chalk.red(`\nError: ${error.message}\n`))
                }
                askQuestion();
                return;
            }

            try {
                process.stdout.write(chalk.blue('\nThinkBox: '));
                const response = await chat(userInput);
                console.log(chalk.white(response) + '\n');
            } catch (error) {
                console.log(chalk.red(`\nError: ${error.message}\n`))
            }
            askQuestion();
            })
        }

        askQuestion();
    }

    main();