// Main TypeScript entry point
console.log('Hello from TypeScript!');

// Example function to demonstrate TypeScript
function greet(name: string): string {
    return `Hello, ${name}!`;
}

// Example of using the function
document.addEventListener('DOMContentLoaded', () => {
    const message = greet('Only Raab 3');
    console.log(message);
    
    // You can add your main application logic here
    const body = document.body;
    if (body) {
        body.setAttribute('data-ts-loaded', 'true');
    }
});

export { greet };
