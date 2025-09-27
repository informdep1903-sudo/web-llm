document.getElementById('send-btn').onclick = async function () {
  const input = document.getElementById('user-input').value;
  document.getElementById('response').innerText = "Консультант думает...";

  request = {
    //"model": "lakomoor/vikhr-llama-3.2-1b-instruct:1b",
    // "model": "owl/t-lite",
    "model": "llama3.1",
    "messages": [
      {
        "role": "system",
        "content": `Ты консультант по языкам программирования. 
        Отвечай профессионально и логично, в ответах приводи примеры кода. Отвечай на
        только на вопросы о языках:  Python, С, C++, JS, HTML. Не отвечай на вопросы 
        о других языках программирования (Scala, Go, PHP  и другие), просто вежливо предложи обратиться
        другому специалисту. Первая буква ответа должна быть заглавной.` 
      },
      {
        "role": "user",
        "content": `${input}`
      },

    ],
    'max_tokens': '50', // Максимальное количество токенов
    "temperature": "0.3" // Температура для генерации текста
  }

  // Пример интеграции с ollama AI
  try {
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
    // Чтение ответа в виде потока
    const reader = response.body.getReader();
    let result = '';
    document.getElementById('response').innerText ='';
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      try {
        let chunk = decoder.decode(value, { stream: true });
        let response_chunk = JSON.parse(chunk);
        if (response_chunk.message.content) {
          result += response_chunk.message.content;
          document.getElementById('response').innerText = result;
        }
      } catch (e) {
        console.log(e);
      }
    }
  } catch (e){
    document.getElementById('response').innerText = "Error contacting AI service.";
    console.log(e);
  }
};

// Обработка нажатия клавиши Enter для ввода в textarea
document.getElementById('user-input').addEventListener('keydown', function(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    document.getElementById('send-btn').click();
  }
});