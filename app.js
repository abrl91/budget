
// MODULES:
// ========
// 1. UI module
// ------------
// get input values
// add the new item to the UI
// update UI

// 2. data module
// --------------
// add the new item to our data structure
// calculate budget

// 3. controller module
// --------------------
// add event handler

const budgetController = (function () {
    const Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    }

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    const Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const calcTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(function (el) {
            sum += el.value;
        });
        data.totals[type] = sum;
    }

    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, desc, val) {
            let newItem, ID;
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val)
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val)
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (id, type) {
           const ids = data.allItems[type].map(function (element) {
               return element.id;
            });

           const index = ids.indexOf(id);

           if (index !== -1) {
               data.allItems[type].splice(index, 1);
           }
        },

        calculateBudget: function () {

          // calculate total inc and exp
            calcTotal('exp');
            calcTotal('inc');

          // calculate the budget: inc - exp
            data.budget = data.totals.inc - data.totals.exp;

          // calculate the % of inc that spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (item) {
                item.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: function () {
            const allPercentages = data.allItems.exp.map(function (item) {
                return item.getPercentage();
            });
            return allPercentages;
        },

        getBudget: function () {
            return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
            }
        },

        testing: function () {
            console.log(data, 'data');
        }
    }

})();

const UIController = (function () {
    const DOM_STRINGS = {
        INPUT_TYPE: '.add__type',
        INPUT_DESCRIPTION: '.add__description',
        INPUT_VALUE: '.add__value',
        ADD_BTN: '.add__btn',
        INCOME_CONTAINER: '.income__list',
        EXPENSES_CONTAINER: '.expenses__list',
        BUDGET_LABEL: '.budget__value',
        INCOME_LABEL: '.budget__income--value',
        EXPENSES_LABEL: '.budget__expenses--value',
        PERCENTAGE: '.budget__expenses--percentage',
        CONTAINER: '.container',
        ICON: '.ion-ios-close-outline',
        EXPENSES_PERCENTAGE_LABEL: '.item__percentage',
        DATE_LABEL: '.budget__title--month'
    };

    const formatNumber = function (num, type) {
        let numSplit, int, dec, sign;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }
        dec = numSplit[1];

        sign = type === 'exp' ? '-' : '+'

        return `${sign} ${int}.${dec}`;
    };

    const nodeListForEach = function (nodeList, cb) {
        for (let i = 0; i < nodeList.length; i++) {
            cb(nodeList[i], i);
        }
    };

    return {
        getInput: function () {
            const type = document.querySelector(DOM_STRINGS.INPUT_TYPE).value;
            const description = document.querySelector(DOM_STRINGS.INPUT_DESCRIPTION).value;
            const value = parseFloat(document.querySelector(DOM_STRINGS.INPUT_VALUE).value);

            return {
                type,
                description,
                value
            }
        },

        addListItem: function (obj, type) {
            // create html string with placeholder text
            let html;
            let element;

            if (type === 'inc') {
                element = DOM_STRINGS.INCOME_CONTAINER;
                html = `
                    <div class="item clearfix" id="inc-${obj.id}">
                        <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                            <div class="item__value">${formatNumber(obj.value, type)}</div>
                            <div class="item__delete">
                                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                            </div>
                        </div>
                    </div>
                `
            } else if (type === 'exp') {
                element = DOM_STRINGS.EXPENSES_CONTAINER;
                html = `
                    <div class="item clearfix" id="exp-${obj.id}">
                       <div class="item__description">${obj.description}</div>
                       <div class="right clearfix">
                           <div class="item__value">${formatNumber(obj.value, type)}</div>
                           <div class="item__percentage"></div>
                           <div class="item__delete">
                               <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                           </div>
                       </div>
                   </div>
                `
            }

            // insert the html into the dom
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },

        deleteListItem: function (selectorId) {
            const itemToDelete = document.getElementById(selectorId);
            const parent = itemToDelete.parentNode;
            parent.removeChild(itemToDelete);
        },

        clearFields: function () {
            const fields = document.querySelectorAll(`${DOM_STRINGS.INPUT_DESCRIPTION}, ${DOM_STRINGS.INPUT_VALUE}`);
            const fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function (field, index, array) {
               field.value = '';
            });
            fieldsArray[0].focus();
        },

        displayBudget: function (obj) {
            let type;
            obj.budget > 0 ? type = 'inc' : type = 'exp'
            document.querySelector(DOM_STRINGS.BUDGET_LABEL).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOM_STRINGS.INCOME_LABEL).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOM_STRINGS.EXPENSES_LABEL).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOM_STRINGS.PERCENTAGE).textContent = `${obj.percentage}%`;
            } else {
                document.querySelector(DOM_STRINGS.PERCENTAGE).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            const fields = document.querySelectorAll(DOM_STRINGS.EXPENSES_PERCENTAGE_LABEL);
            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = `${percentages[index]}%`;
                } else {
                    current.textContent = '---';
                }
            })
        },

        displayMonth: function () {
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            const now = new Date();
            const year = now.getFullYear();
            const month = monthNames[now.getMonth()];

            document.querySelector(DOM_STRINGS.DATE_LABEL).textContent = `${month} ${year}`;
        },

        changeType: function () {
            const fields = document.querySelectorAll(`
                ${DOM_STRINGS.INPUT_TYPE},
                ${DOM_STRINGS.INPUT_DESCRIPTION},
                ${DOM_STRINGS.INPUT_VALUE}
            `);

            nodeListForEach(fields, function (element) {
                return element.classList.toggle('red-focus');
            });

            document.querySelector(DOM_STRINGS.ADD_BTN).classList.toggle('red');
        },

        getDOMStrings: function () {
            return DOM_STRINGS;
        }
    }
})();

const controller = (function (budgetCtrl, UICtrl) {
    const setupEventListeners = function () {
        const DOM = UICtrl.getDOMStrings();

        document.querySelector(DOM.ADD_BTN).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.CONTAINER).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.INPUT_TYPE).addEventListener('change', UICtrl.changeType)


    };

    const updateBudget = function () {
        // 1. calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        const budget = budgetCtrl.getBudget();

        // 3. display the budget on the UI
        UICtrl.displayBudget(budget);

    };

    const updatePercentages = function () {

        // 1. calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. read percentages from budget controller
        const percentages = budgetCtrl.getPercentages();

        // 3. update the UI with the new percentages
        UICtrl.displayPercentages(percentages);

    }

    const ctrlAddItem = function () {
        // 1. get the field input data
        const input = UIController.getInput();

        if (input.description && !isNaN(input.value) && input.value > 0) {

            // 2. add the item to the budget controller
            const newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. clear the fields
            UICtrl.clearFields();

            // 5. calculate and update budget
            updateBudget();

            // 6. calculate and display the percentages
            updatePercentages();
        }

    };

    const ctrlDeleteItem = function (event) {
       const itemID = event.target.parentNode.parentElement.parentNode.parentNode.id;

       if (itemID) {
           const splitID = itemID.split('-');
           const type = splitID[0];
           const ID = parseInt(splitID[1]);

           // 1.delete the item from the data structure
           budgetCtrl.deleteItem(ID, type);

           // 2. delete the item from the UI
           UICtrl.deleteListItem(itemID);

           // 3. update and show the new budget
           updateBudget();

           // 4. calculate and display the percentages
           updatePercentages();

       }
    };

    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            UICtrl.displayMonth();
            setupEventListeners();
        }
    }

})(budgetController, UIController);

controller.init();



// event delegation:
// to NOT set up the event handler on the original element that we are interesting in
// but to attach it to a parent element and catch the event there, because it bubbled up
// and then we can act on the element which we interesting in using the target element property

// use cases for event delegation
// 1. when we have an element with lots of child elements that we are interesting in.
// 2. when we want an event handler attached to an element that is not yet in the DOM when our page is loaded
