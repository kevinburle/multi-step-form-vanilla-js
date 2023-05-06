import get from "./src/getElement.js";

function MultiStepForm(element) {
  this.form = element;
  this.currentStep = 1;
  this.validity = false;

  // data Object
  this.formData = {
    plans: [
      {
        name: "arcade",
        image: "./assets/images/icon-arcade.svg",
        monthly: 9,
        yearly: 90,
      },
      {
        name: "advanced",
        image: "./assets/images/icon-advanced.svg",
        monthly: 12,
        yearly: 120,
      },
      {
        name: "pro",
        image: "./assets/images/icon-pro.svg",
        monthly: 15,
        yearly: 150,
      },
    ],
    addons: [
      {
        id: 1,
        name: "online service",
        desc: "access to multiplayer games",
        monthly: 1,
        yearly: 10,
      },
      {
        id: 2,
        name: "larger storage",
        desc: "extra 1TB of cloud save",
        monthly: 2,
        yearly: 20,
      },
      {
        id: 3,
        name: "customizable profile",
        desc: "custom theme on your profile",
        monthly: 2,
        yearly: 20,
      },
    ],
  };

  // bind this.formData
  const self = this.formData;

  // user Object
  this.userData = {
    name: null,
    email: null,
    phone: null,
    plan: "arcade",
    planPrice: function () {
      const selected = self.plans.find((plan) => plan.name === this.plan);
      return this.monthly ? selected.monthly : selected.yearly;
    },
    monthly: true,
    service: [],
    servicePrice: function () {
      return this.service.map((option) => {
        return this.monthly
          ? self.addons[option - 1].monthly
          : self.addons[option - 1].yearly;
      });
    },
    totalPrice: function () {
      const total = this.servicePrice()
        .concat(this.planPrice())
        .reduce((acc, curr) => {
          return acc + curr;
        });
      return this.monthly ? `$${total}/mo` : `$${total}/yr`;
    },
  };

  // binding
  this.nextStep = this.nextStep.bind(this);
  this.prevStep = this.prevStep.bind(this);
  this.changePlan = this.changePlan.bind(this);

  this.showStep(this.currentStep);
}

MultiStepForm.prototype.showStep = function (step) {
  const stepDOM = this.form.querySelector(`#step-${step}`);
  // remove hide class on the current step
  stepDOM.classList.remove("hide");

  const nextButton = this.form.querySelector(`#step-${step} .next`);
  if (nextButton) {
    nextButton.addEventListener("click", this.nextStep);
  }

  const prevButton = this.form.querySelector(`#step-${step} .prev`);
  if (prevButton) {
    prevButton.addEventListener("click", this.prevStep);
  }

  const dots = this.form.querySelectorAll(".dot");

  // add selected class on dot
  dots.forEach((dot) => {
    if (step < 5) {
      dot !== dots[step - 1]
        ? dot.classList.remove("selected")
        : dots[step - 1].classList.add("selected");
    } else {
      // dot step 4 stay selected on the thank you page (step 5)
      dots[step - 2].classList.add("selected");
    }
  });

  // select step
  switch (stepDOM.id) {
    case "step-2":
      this.step2(step);
      break;
    case "step-3":
      this.step3(step);
      break;
    case "step-4":
      this.step4(step);
      break;
  }
};

MultiStepForm.prototype.step2 = function (step) {
  const stepDOM = this.form.querySelector(`#step-${step}`);
  const switchDOM = stepDOM.querySelector("input[type=checkbox]");

  // display plan dynamically
  const planDOM = this.form.querySelector(".plans");
  planDOM.innerHTML = this.formData.plans
    .map((plan) => {
      const { name, image, monthly, yearly } = plan;
      return `<!-- plan 1 -->
    <li class="plan" data-id="${name}">
      <img src="${image}" alt="${name}" />
      <p class="offer">
      <span class="capitalize">${name}</span><span class="price">${
        switchDOM.checked ? `$${yearly}/yr` : `$${monthly}/mo`
      }</span
        ><span class="yearly" ${
          switchDOM.checked ? 'style="display:block"' : 'style="display:none"'
        }>2 months free</span>
      </p>
    </li>`;
    })
    .join("");

  // target all plan
  const plans = [...stepDOM.querySelectorAll(".plan")];

  // by default, select arcade plan in object
  let selectedPlan = stepDOM.querySelector(`[data-id=${this.userData.plan}]`);

  selectedPlan.classList.add("selected");
  plans.map((plan) => {
    plan.addEventListener("click", () => {
      //add the class on the clicked element
      plan.classList.add("selected");

      // remove the class from the previously selected element
      if (selectedPlan && selectedPlan !== plan) {
        selectedPlan.classList.remove("selected");
      }

      // update the selected element to the clicked element
      selectedPlan = plan.classList.contains("selected") ? plan : null;

      // change plan in data object
      this.userData.plan = selectedPlan.dataset.id;
    });
  });

  if (switchDOM) {
    switchDOM.addEventListener("change", () => {
      plans.map((plan, index) => {
        if (switchDOM.checked) {
          // display yearly price
          plan.children[1].children[1].innerHTML = `$${
            this.formData.plans[index].name === plan.dataset.id
              ? this.formData.plans[index].yearly
              : null
          }/yr`;

          // display free month
          plan.children[1].children[2].style.display = "block";

          // change to yearly in data object
          this.userData.monthly = false;
        } else {
          // display monthly price
          plan.children[1].children[1].innerHTML = `$${
            this.formData.plans[index].name === plan.dataset.id
              ? this.formData.plans[index].monthly
              : null
          }/mo`;

          // display free month
          plan.children[1].children[2].style.display = "none";

          // change to monthly in data object
          this.userData.monthly = true;
        }
      });
    });
  }
};

MultiStepForm.prototype.step3 = function (step) {
  const stepDOM = this.form.querySelector(`#step-${step}`);
  const addonsDOM = stepDOM.querySelector(".add-ons");

  // display addon dynamically
  addonsDOM.innerHTML = this.formData.addons
    .map((addon) => {
      const { id, name, desc, monthly, yearly } = addon;

      return `<li class="add-on" data-id="${id}">
  <label>
    <!-- custom checkbox -->
    <label class="check-container">
      <input type="checkbox" ${
        this.userData.service.includes(id) ? "checked" : ""
      }/>
      <span class="checkmark"></span>
    </label>
    <p class="offer">
      <span class="capitalize">${name}</span><span class="details"
        >${desc}</span
      >
    </p>
  </label>
  <span class="price">${
    this.userData.monthly === false ? `+$${yearly}/yr` : `+$${monthly}/mo`
  }</span>
</li>`;
    })
    .join("");

  const checkboxes = stepDOM.querySelectorAll("input[type=checkbox]");

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", (e) => {
      const checkboxID = parseInt(
        e.target.parentElement.parentElement.parentElement.dataset.id
      );
      if (e.target.checked) {
        // save checkbox statement in user object
        this.userData.service.push(checkboxID);
      } else {
        const index = this.userData.service.indexOf(checkboxID);
        if (index !== -1) {
          this.userData.service.splice(index, 1);
        }
      }
    });
  });
};

MultiStepForm.prototype.step4 = function (step) {
  const stepDOM = this.form.querySelector(`#step-${step}`);
  //sort numbers in ascending order in the array (only for UX)
  this.userData.service.sort((a, b) => a - b);

  // target element
  const finishingDOM = stepDOM.querySelector(".finishing");

  // removes options in the DOM if options were added
  // because we insert options with the insertAdjacentHTML method
  // options need to be removed before being added again
  if (stepDOM.querySelector(".options")) {
    const options = stepDOM.querySelectorAll(".options");
    options.forEach((option) => {
      option.remove();
    });
  }

  // get data from objects
  const subscribtion = this.userData.plan;
  const subscribtionPrice = this.userData.monthly
    ? `$${this.userData.planPrice()}/mo`
    : `$${this.userData.planPrice()}/yr`;

  // display subscription DOM (first line)
  finishingDOM.children[0].children[0].innerHTML = ` ${subscribtion} (${
    this.userData.monthly ? "monthly" : "yearly"
  })<a class="change">Change</a>`;
  finishingDOM.children[0].children[1].textContent = subscribtionPrice;

  // display options
  const optionSelected = this.userData.service
    .map((id) => {
      const addon = this.formData.addons[id - 1];
      const addonPrice = this.userData.monthly
        ? `+$${addon.monthly}/mo`
        : `+$${addon.yearly}/yr`;

      return `<li class="boxe options">
       <p class="offer">${addon.name}</p>
       <span class="price">${addonPrice}</span>
     </li>`;
    })
    .join("");

  // add options to the DOM after first line
  finishingDOM.children[0].insertAdjacentHTML("afterend", optionSelected);

  // display total (last line)
  const lastLine = finishingDOM.children.length - 1;
  finishingDOM.children[lastLine].children[0].textContent = `Total (${
    this.userData.monthly ? "per month" : "per year"
  })`;

  // display total
  finishingDOM.children[lastLine].children[1].textContent =
    this.userData.totalPrice();

  // add event listener to change current plan
  const changeBtn = stepDOM.querySelector(".change");
  changeBtn.addEventListener("click", this.changePlan);
};

MultiStepForm.prototype.changePlan = function () {
  const stepDOM = this.form.querySelector(`#step-${this.currentStep}`);
  stepDOM.classList.add("hide");
  this.currentStep = 2;
  this.showStep(this.currentStep);
};

MultiStepForm.prototype.checkFormValididty = function (step) {
  const stepDOM = this.form.querySelector(`#step-${step}`);
  const form = stepDOM.querySelector(".form");

  // get the input fields
  const name = form.querySelector("#name");
  const email = form.querySelector("#email");
  const phone = form.querySelector("#phone");

  // Define regular expressions for name, email and phone number validation
  const nameRegex = /^[a-zA-Z]+(([',. -][a-zA-Z ])?[a-zA-Z]*)*$/;
  const emailRegex = /^\S+@\S+\.\S+$/;
  const phoneRegex = /^[0-9]{10}$/;

  // Validate name
  if (!nameRegex.test(name.value)) {
    name.parentElement.classList.add("error");
    this.userData.email = null;
    this.validity = false;
  } else if (nameRegex.test(name.value)) {
    name.parentElement.classList.remove("error");
    this.userData.name = name.value;
  }

  // Validate email
  if (!emailRegex.test(email.value)) {
    email.parentElement.classList.add("error");
    this.userData.email = null;
    this.validity = false;
  } else if (emailRegex.test(email.value)) {
    email.parentElement.classList.remove("error");
    this.userData.email = email.value;
  }

  // Validate phone
  if (!phoneRegex.test(phone.value)) {
    phone.parentElement.classList.add("error");
    this.userData.phone = null;
    this.validity = false;
  } else if (phoneRegex.test(phone.value)) {
    phone.parentElement.classList.remove("error");
    this.userData.phone = phone.value;
  }

  // change validity flag
  if (
    nameRegex.test(name.value) &&
    emailRegex.test(email.value) &&
    phoneRegex.test(phone.value)
  ) {
    this.validity = true;
  }

  return this.validity;
};

MultiStepForm.prototype.nextStep = function () {
  const stepDOM = this.form.querySelector(`#step-${this.currentStep}`);

  // check valididty of data if first step
  if (this.currentStep === 1) {
    if (!this.checkFormValididty(this.currentStep)) {
      return;
    }
  }

  stepDOM.classList.add("hide");
  this.currentStep++;
  this.showStep(this.currentStep);
};

MultiStepForm.prototype.prevStep = function () {
  const stepDOM = this.form.querySelector(`#step-${this.currentStep}`);
  stepDOM.classList.add("hide");
  this.currentStep--;
  this.showStep(this.currentStep);
};

const multiStepForm = new MultiStepForm(get(".step-form"));
