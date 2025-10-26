// Application state
const state = {
  currentScreen: 'welcome-screen',
  userType: null,
  questionnaireData: {
    debtAmount: 0,
    delayPeriod: '',
    debtTypes: [],
    hasProperty: null,
    hasIncome: null
  },
  chatHistory: []
};

// Screen navigation
function showScreen(screenId) {
  // Hide all screens
  const screens = document.querySelectorAll('.screen');
  screens.forEach(screen => screen.classList.remove('active'));
  
  // Show target screen
  const targetScreen = document.getElementById(screenId);
  if (targetScreen) {
    targetScreen.classList.add('active');
    state.currentScreen = screenId;
    
    // Special handling for specific screens
    if (screenId === 'chat-screen' && state.chatHistory.length === 0) {
      initializeChat();
    }
  }
}

// User type selection
function selectUserType(type) {
  state.userType = type;
  showScreen('questionnaire-screen');
}

// Toggle buttons
function toggleOption(button, inputId) {
  const container = button.parentElement;
  const buttons = container.querySelectorAll('.toggle-btn');
  const hiddenInput = document.getElementById(inputId);
  
  buttons.forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  hiddenInput.value = button.dataset.value;
  
  validateQuestionnaireForm();
}

// Form validation
function validateQuestionnaireForm() {
  const debtAmount = document.getElementById('debt-amount').value;
  const delayPeriod = document.getElementById('delay-period').value;
  const debtTypes = document.querySelectorAll('input[name="debt-type"]:checked');
  const hasProperty = document.getElementById('has-property').value;
  const hasIncome = document.getElementById('has-income').value;
  const submitBtn = document.getElementById('questionnaire-submit');
  
  if (debtAmount && delayPeriod && debtTypes.length > 0 && hasProperty && hasIncome) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
}

// Questionnaire form submission
document.addEventListener('DOMContentLoaded', function() {
  // Form validation listeners
  const form = document.getElementById('questionnaire-form');
  if (form) {
    form.addEventListener('input', validateQuestionnaireForm);
    form.addEventListener('change', validateQuestionnaireForm);
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Collect form data
      const debtTypes = Array.from(document.querySelectorAll('input[name="debt-type"]:checked'))
        .map(cb => cb.value);
      
      state.questionnaireData = {
        debtAmount: parseInt(document.getElementById('debt-amount').value),
        delayPeriod: document.getElementById('delay-period').value,
        debtTypes: debtTypes,
        hasProperty: document.getElementById('has-property').value,
        hasIncome: document.getElementById('has-income').value
      };
      
      showScreen('chat-screen');
    });
  }
  
  // Booking form submission
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simulate form submission
      const modal = document.getElementById('success-modal');
      modal.classList.add('active');
      
      // Reset form
      bookingForm.reset();
    });
  }
  
  // Chat input enter key
  const chatInput = document.getElementById('chat-input');
  if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });
  }
});

// Initialize chat with personalized greeting
function initializeChat() {
  const chatContainer = document.getElementById('chat-messages');
  chatContainer.innerHTML = '';
  
  const greeting = generatePersonalizedGreeting();
  addAIMessage(greeting);
}

// Generate personalized greeting based on questionnaire
function generatePersonalizedGreeting() {
  const { debtAmount, delayPeriod, debtTypes, hasProperty, hasIncome } = state.questionnaireData;
  const userTypeText = state.userType === 'individual' ? 'физическое лицо' : 'индивидуальный предприниматель';
  
  let greeting = `Здравствуйте! Я AI-консультант по банкротству. Вижу, что вы ${userTypeText} с задолженностью ${formatNumber(debtAmount)} рублей. `;
  
  // Provide specific advice based on debt amount
  if (debtAmount >= 500000) {
    greeting += `При такой сумме долга (более 500,000 руб) и просрочке более 3 месяцев процедура банкротства является обязательной по закону. `;
  } else if (debtAmount >= 25000 && debtAmount <= 1000000 && hasProperty === 'no') {
    greeting += `Ваша ситуация может подойти для упрощенной процедуры банкротства через МФЦ, которая является бесплатной и занимает около 6 месяцев. `;
  } else {
    greeting += `Для вашей ситуации возможна как судебная процедура банкротства, так и внесудебные варианты решения долговой проблемы. `;
  }
  
  greeting += '\n\nЯ готов ответить на все ваши вопросы о процедуре банкротства, её стоимости, сроках и последствиях. Вы можете выбрать один из быстрых вопросов ниже или задать свой вопрос.';
  
  return greeting;
}

// Add AI message to chat
function addAIMessage(text) {
  const chatContainer = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message ai';
  messageDiv.innerHTML = `
    <div class="message-avatar">AI</div>
    <div class="message-content">${text.replace(/\n/g, '<br>')}</div>
  `;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  state.chatHistory.push({ role: 'ai', content: text });
}

// Add user message to chat
function addUserMessage(text) {
  const chatContainer = document.getElementById('chat-messages');
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message user';
  messageDiv.innerHTML = `
    <div class="message-avatar">Вы</div>
    <div class="message-content">${text}</div>
  `;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  
  state.chatHistory.push({ role: 'user', content: text });
}

// Send message from input
function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  
  if (message) {
    addUserMessage(message);
    input.value = '';
    
    // Simulate AI thinking delay
    setTimeout(() => {
      const response = generateAIResponse(message);
      addAIMessage(response);
    }, 1000);
  }
}

// Quick question handler
function askQuickQuestion(button) {
  const question = button.dataset.question;
  addUserMessage(question);
  
  setTimeout(() => {
    const response = generateAIResponse(question);
    addAIMessage(response);
  }, 1000);
}

// Generate AI response based on question
function generateAIResponse(question) {
  const lowerQuestion = question.toLowerCase();
  const { debtAmount, hasProperty, hasIncome } = state.questionnaireData;
  const userTypeText = state.userType === 'individual' ? 'физических лиц' : 'ИП';
  
  // Response logic based on question content
  if (lowerQuestion.includes('процедура') || lowerQuestion.includes('подходит')) {
    let response = `Исходя из вашей ситуации (долг ${formatNumber(debtAmount)} руб), рекомендую следующее:\n\n`;
    
    if (debtAmount >= 500000) {
      response += `**Судебное банкротство** - подходит для вашего случая:\n`;
      response += `• Срок: 6-12 месяцев\n`;
      response += `• Стоимость: 30,000-90,000 рублей\n`;
      response += `• Этапы: подача заявления → назначение управляющего → реструктуризация или реализация имущества → освобождение от долгов\n\n`;
    }
    
    if (debtAmount >= 25000 && debtAmount <= 1000000 && hasProperty === 'no') {
      response += `**Упрощенное банкротство через МФЦ** - более простой вариант:\n`;
      response += `• Срок: 6 месяцев\n`;
      response += `• Стоимость: бесплатно\n`;
      response += `• Условия: нет имущества для взыскания, закрытые исполнительные производства`;
    }
    
    return response;
  }
  
  if (lowerQuestion.includes('стоимость') || lowerQuestion.includes('стоит')) {
    return `Стоимость процедуры банкротства ${userTypeText} зависит от выбранного варианта:\n\n**Судебное банкротство:**\n• От 30,000 до 90,000 рублей\n• Включает: госпошлину (300 руб), услуги финансового управляющего (от 25,000 руб), публикации в ЕФРСБ, юридическое сопровождение\n\n**Упрощенное через МФЦ:**\n• Полностью бесплатно\n• Доступно при долге 25,000-1,000,000 руб и отсутствии имущества\n\nХотите узнать подробнее о каком-то варианте?`;
  }
  
  if (lowerQuestion.includes('документ')) {
    return `Для процедуры банкротства ${userTypeText} потребуются:\n\n**Основные документы:**\n• Паспорт\n• СНИЛС\n• ИНН\n\n**Финансовые документы:**\n• Документы о долгах (кредитные договоры, решения судов)\n• Справки из банков о задолженности\n• Сведения о доходах за последние 3 года\n\n**Имущество:**\n• Список имущества с оценкой\n• Выписки из ЕГРН\n• Документы на транспорт\n\n**Дополнительно для ИП:**\n• Выписка из ЕГРИП\n• Бухгалтерская отчетность\n\nЯ могу помочь проверить ваш пакет документов на личной консультации.`;
  }
  
  if (lowerQuestion.includes('длится') || lowerQuestion.includes('срок')) {
    return `Сроки процедуры банкротства ${userTypeText}:\n\n**Упрощенное банкротство через МФЦ:**\n• 6 месяцев - фиксированный срок\n\n**Судебное банкротство:**\n• Обычно 6-12 месяцев\n• Реструктуризация долгов: до 3 лет\n• Реализация имущества: 6 месяцев (может продлеваться)\n\n**Этапы судебной процедуры:**\n1. Подача заявления (1-2 недели)\n2. Рассмотрение заявления судом (1-3 месяца)\n3. Процедура реструктуризации или реализации (6-9 месяцев)\n4. Завершение и освобождение от долгов\n\nТочный срок зависит от сложности вашей ситуации.`;
  }
  
  if (lowerQuestion.includes('имущество')) {
    const propertyResponse = hasProperty === 'yes' 
      ? 'Вы указали, что у вас есть имущество. Важно знать:' 
      : 'Вы указали, что у вас нет имущества. В этом случае:';
    
    return `${propertyResponse}\n\n**Защищенное имущество (не продается):**\n• Единственное жилье (кроме ипотечного)\n• Личные вещи и предметы домашнего обихода\n• Имущество стоимостью до 10,000 руб\n• Продукты питания\n• Призы и награды\n\n**Может быть реализовано:**\n• Вторая квартира, дача\n• Дорогостоящие вещи\n• Транспорт\n• Доля в бизнесе\n• Денежные средства на счетах\n\nФинансовый управляющий проведет оценку имущества и составит план реализации.`;
  }
  
  // Default response
  return `Благодарю за ваш вопрос. ${state.userType === 'individual' ? 'Для физических лиц' : 'Для индивидуальных предпринимателей'} процедура банкротства - это легальный способ решить проблему с долгами.\n\nОсновные преимущества:\n• Полное списание долгов\n• Остановка начисления процентов и штрафов\n• Прекращение давления кредиторов\n• Снятие запрета на выезд\n\nЕсли у вас есть конкретные вопросы о вашей ситуации, я рекомендую записаться на личную консультацию с юристом. Нажмите кнопку "Записаться" в верхней части экрана.\n\nЧем еще я могу вам помочь?`;
}

// Tab switching
function switchTab(tabName) {
  // Update tab buttons
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  
  // Update tab content
  const tabPanes = document.querySelectorAll('.tab-pane');
  tabPanes.forEach(pane => pane.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');
}

// Close success modal
function closeSuccessModal() {
  const modal = document.getElementById('success-modal');
  modal.classList.remove('active');
  showScreen('welcome-screen');
}

// Utility function to format numbers
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Phone input formatting
document.addEventListener('DOMContentLoaded', function() {
  const phoneInput = document.getElementById('booking-phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 0) {
        if (value[0] === '7' || value[0] === '8') {
          value = value.substring(1);
        }
        if (value.length > 10) {
          value = value.substring(0, 10);
        }
        let formatted = '+7';
        if (value.length > 0) {
          formatted += ' (' + value.substring(0, 3);
        }
        if (value.length >= 4) {
          formatted += ') ' + value.substring(3, 6);
        }
        if (value.length >= 7) {
          formatted += '-' + value.substring(6, 8);
        }
        if (value.length >= 9) {
          formatted += '-' + value.substring(8, 10);
        }
        e.target.value = formatted;
      }
    });
  }
});