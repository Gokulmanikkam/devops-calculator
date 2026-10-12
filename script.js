
const display = document.getElementById("display");
const previousDisplay = document.getElementById("previous");
const message = document.getElementById("message");
const keys = document.querySelector(".keys");

let currentInput = "0";
let storedValue = null;
let selectedOperator = null;
let waitingForOperand = false;

function updateDisplay() {
    display.textContent = currentInput;
}

function clearCalculator() {
    currentInput = "0";
    storedValue = null;
    selectedOperator = null;
    waitingForOperand = false;

    previousDisplay.textContent = "";
    message.textContent = "";
    updateDisplay();
}

function inputNumber(number) {
    message.textContent = "";

    if (waitingForOperand) {
        currentInput = number;
        waitingForOperand = false;
    } else if (currentInput === "0") {
        currentInput = number;
    } else if (currentInput === "-0") {
        currentInput = "-" + number;
    } else if (currentInput.length < 15) {
        currentInput += number;
    }

    updateDisplay();
}

function inputDecimal() {
    message.textContent = "";

    if (waitingForOperand) {
        currentInput = "0.";
        waitingForOperand = false;
    } else if (!currentInput.includes(".")) {
        currentInput += ".";
    }

    updateDisplay();
}

function toggleSign() {
    message.textContent = "";

    if (currentInput !== "0") {
        currentInput = currentInput.startsWith("-")
            ? currentInput.slice(1)
            : "-" + currentInput;
    }

    updateDisplay();
}

function deleteLastDigit() {
    message.textContent = "";

    if (waitingForOperand) return;

    currentInput = currentInput.slice(0, -1);

    if (currentInput === "" || currentInput === "-") {
        currentInput = "0";
    }

    updateDisplay();
}

function calculate(a, b, operator) {
    switch (operator) {
        case "+":
            return a + b;
        case "-":
            return a - b;
        case "*":
            return a * b;
        case "/":
            if (b === 0) {
                throw new Error("Cannot divide by zero.");
            }
            return a / b;
        default:
            throw new Error("Unknown operation.");
    }
}

function formatResult(number) {
    if (!Number.isFinite(number)) {
        throw new Error("Result is outside the supported range.");
    }

    return String(Number(number.toPrecision(10)));
}

function chooseOperator(operator) {
    message.textContent = "";

    const inputValue = Number(currentInput);

    if (selectedOperator && !waitingForOperand) {
        try {
            const result = calculate(storedValue, inputValue, selectedOperator);
            currentInput = formatResult(result);
            storedValue = result;
            updateDisplay();
        } catch (error) {
            message.textContent = error.message;
            return;
        }
    } else {
        storedValue = inputValue;
    }

    selectedOperator = operator;
    waitingForOperand = true;
    previousDisplay.textContent = `${currentInput} ${operator}`;
}

function performCalculation() {
    if (selectedOperator === null || waitingForOperand) return;

    const operator = selectedOperator;
    const firstValue = storedValue;
    const secondValue = Number(currentInput);

    try {
        const result = calculate(firstValue, secondValue, operator);

        previousDisplay.textContent =
            `${firstValue} ${operator} ${secondValue} =`;

        currentInput = formatResult(result);
        storedValue = null;
        selectedOperator = null;
        waitingForOperand = true;

        updateDisplay();
        message.textContent = "";
    } catch (error) {
        message.textContent = error.message;
    }
}

keys.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) return;

    if (button.dataset.number !== undefined) {
        inputNumber(button.dataset.number);
        return;
    }

    if (button.dataset.operator) {
        chooseOperator(button.dataset.operator);
        return;
    }

    switch (button.dataset.action) {
        case "clear":
            clearCalculator();
            break;
        case "delete":
            deleteLastDigit();
            break;
        case "decimal":
            inputDecimal();
            break;
        case "sign":
            toggleSign();
            break;
        case "equals":
            performCalculation();
            break;
    }
});

document.addEventListener("keydown", (event) => {
    if (/^[0-9]$/.test(event.key)) {
        inputNumber(event.key);
    } else if (event.key === ".") {
        inputDecimal();
    } else if (["+", "-", "*", "/"].includes(event.key)) {
        chooseOperator(event.key);
    } else if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        performCalculation();
    } else if (event.key === "Backspace") {
        deleteLastDigit();
    } else if (event.key === "Escape") {
        clearCalculator();
    }
});

updateDisplay();
