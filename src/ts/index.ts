// Main TypeScript entry point
// Import the LESS styles
import '../less/index.less';

// Import external tool integration
import { processWithExternalTool, type ExternalToolInterface } from './external-integration';

console.log('Hello from TypeScript!');

// Example function to demonstrate TypeScript
function greet(name: string): string {
    return `Hello, ${name}!`;
}

// Example of using the function
document.addEventListener('DOMContentLoaded', () => {
    const message = greet('Only Raab 334d4');
    console.log(message);
    
    // You can add your main application logic here
    const body = document.body;
    if (body) {
        body.setAttribute('data-ts-loaded', 'true');
    }
    
    // Example of using external tool integration
    const testData = '{"test": "data"}';
    const result: ExternalToolInterface | null = processWithExternalTool(testData);
    if (result) {
        console.log('External tool result:', result);
    }
});

export { greet };
