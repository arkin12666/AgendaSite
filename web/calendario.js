document.addEventListener("DOMContentLoaded", function () {
  const containerCalendario = document.getElementById("calendar-container");

  const mapaMeses = {
    JAN: 0, FEV: 1, MAR: 2, ABR: 3,
    MAI: 4, JUN: 5, JUL: 6, AGO: 7,
    SET: 8, OUT: 9, NOV: 10, DEZ: 11,
  };

  let anoAtual = new Date().getFullYear();
  let mesAtualIndice = new Date().getMonth();

  let lembretes = JSON.parse(localStorage.getItem('alarms')) || [];

  renderizarSelecaoMeses();

  // Função para renderizar a tela de seleção de meses
  function renderizarSelecaoMeses() {
    containerCalendario.innerHTML = "";

    const navegacao = criarNavegacao(false);
    containerCalendario.appendChild(navegacao);

    const gradeMeses = document.createElement("div");
    gradeMeses.className = "calendario";

    Object.keys(mapaMeses).forEach((mes) => {
      const link = document.createElement("a");
      link.href = "#";
      link.dataset.mes = mes;
      link.textContent = mes;
      
      const boxDay = document.createElement("div");
      boxDay.className = "box-day";
      
      // Calcula o primeiro dia do mês
      const primeiroDia = new Date(anoAtual, mapaMeses[mes], 1);
      const ultimoDia = new Date(anoAtual, mapaMeses[mes] + 1, 0);
      const primeiroDiaSemana = primeiroDia.getDay();
      const diasMesAnterior = new Date(anoAtual, mapaMeses[mes], 0).getDate();
      
      // Adiciona as linhas das semanas (5 semanas)
      for (let i = 0; i < 5; i++) {
        const weekLine = document.createElement("div");
        weekLine.className = "week-line";
        
        // Adiciona os pontos dos dias (7 dias por semana)
        for (let j = 0; j < 7; j++) {
          const dayDot = document.createElement("div");
          dayDot.className = "day-dot";
          
          // Calcula o dia correto considerando o início do mês
          let dia;
          let isCurrentMonth = true;
          
          if (i === 0 && j < primeiroDiaSemana) {
            // Dias do mês anterior
            dia = diasMesAnterior - (primeiroDiaSemana - j - 1);
            dayDot.style.opacity = "0.5";
            isCurrentMonth = false;
          } else {
            // Dias do mês atual
            dia = (i * 7 + j) - primeiroDiaSemana + 1;
            if (dia > ultimoDia.getDate()) {
              // Dias do próximo mês
              dia = dia - ultimoDia.getDate();
              dayDot.style.opacity = "0.5";
              isCurrentMonth = false;
            }
          }
          
          // Verifica se há alarmes apenas para os dias do mês atual
          if (isCurrentMonth) {
            const lembretesDia = obterLembretesParaDia(anoAtual, mapaMeses[mes], dia);
            if (lembretesDia.length > 0) {
              dayDot.classList.add("has-alarm");
            }
          }
          
          weekLine.appendChild(dayDot);
        }
        
        boxDay.appendChild(weekLine);
      }
      
      link.appendChild(boxDay);
      
      link.addEventListener("click", (e) => {
        e.preventDefault();
        mesAtualIndice = mapaMeses[mes];
        renderizarVisualizacaoMes(mes);
      });
      gradeMeses.appendChild(link);
    });

    containerCalendario.appendChild(gradeMeses);
  }

  // Função para renderizar a visualização do mês selecionado
  function renderizarVisualizacaoMes(chaveMes) {
    containerCalendario.innerHTML = "";
    mesAtualIndice = mapaMeses[chaveMes];

    const navegacao = criarNavegacao(true);
    containerCalendario.appendChild(navegacao);

    renderizarVisualizacaoDias(mesAtualIndice, anoAtual);
  }

  // Função para criar a barra de navegação
  function criarNavegacao(mostrarBotoes = false) {
    const navegacao = document.createElement("div");
    navegacao.className = "view-nav";
    navegacao.style.display = "flex";
    navegacao.style.justifyContent = "space-between";
    navegacao.style.alignItems = "center";
    navegacao.style.height = "30px";

    const wrapperAno = document.createElement("div");
    wrapperAno.style.flex = "1";
    wrapperAno.style.display = "flex";
    wrapperAno.style.justifyContent = "flex-start";

    const seletorAno = criarSeletorAno(() => {
      if (mostrarBotoes) {
        renderizarVisualizacaoDias(mesAtualIndice, anoAtual);
      } else {
        renderizarSelecaoMeses();
      }
    });

    wrapperAno.appendChild(seletorAno);
    navegacao.appendChild(wrapperAno);

    const wrapperDireita = document.createElement("div");
    wrapperDireita.style.flex = "1";
    wrapperDireita.style.display = "flex";
    wrapperDireita.style.justifyContent = "flex-end";

    if (mostrarBotoes) {
      const botaoVoltar = criarBotao("VOLTAR", renderizarSelecaoMeses);
      const botaoAnterior = criarBotao("<", () => mudarMes(-1));
      const botaoProximo = criarBotao(">", () => mudarMes(1));
      wrapperDireita.append(botaoVoltar, botaoAnterior, botaoProximo);
    }

    navegacao.appendChild(wrapperDireita);
    return navegacao;
  }

  // Função para criar o seletor de ano
  function criarSeletorAno(callbackMudanca) {
    const seletorAno = document.createElement("input");
    seletorAno.type = "number";
    seletorAno.min = 1900;
    seletorAno.max = 2100;
    seletorAno.value = anoAtual;

    Object.assign(seletorAno.style, {
      width: "80px",
      padding: "5px",
      borderRadius: "6px",
      border: "none",
      fontWeight: "700",
      letterSpacing: "1.5px",
    });

    seletorAno.addEventListener("change", () => {
      const novoAno = parseInt(seletorAno.value);
      if (!isNaN(novoAno) && novoAno >= 1900 && novoAno <= 2100) {
        anoAtual = novoAno;
        callbackMudanca();
      }
    });

    return seletorAno;
  }

  // Função para criar botões
  function criarBotao(texto, onClick) {
    const botao = document.createElement("button");
    botao.textContent = texto;
    botao.className = "botoes";
    botao.style.marginLeft = "10px";
    botao.addEventListener("click", onClick);
    return botao;
  }

  // Função para mudar o mês
  function mudarMes(direcao) {
    mesAtualIndice += direcao;
    if (mesAtualIndice < 0) {
      mesAtualIndice = 11;
      anoAtual--;
    } else if (mesAtualIndice > 11) {
      mesAtualIndice = 0;
      anoAtual++;
    }
    renderizarVisualizacaoDias(mesAtualIndice, anoAtual);
  }

  // Função para renderizar a visualização dos dias
  function renderizarVisualizacaoDias(indiceMes, ano) {
    const conteudoExistente = containerCalendario.querySelector(".view-content");
    if (conteudoExistente) conteudoExistente.remove();

    const conteudo = document.createElement("div");
    conteudo.className = "view-content";

    const titulo = document.createElement("h2");
    titulo.textContent = `${obterChaveMesPorIndice(indiceMes)} ${ano}`;
    conteudo.appendChild(titulo);

    const grade = document.createElement("div");
    grade.className = "days-grid";

    // Adiciona os cabeçalhos dos dias da semana
    const diasSemana = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
    diasSemana.forEach(dia => {
      const celulaCabecalho = document.createElement("div");
      celulaCabecalho.className = "day-header";
      celulaCabecalho.textContent = dia;
      grade.appendChild(celulaCabecalho);
    });

    const primeiroDia = new Date(ano, indiceMes, 1);
    const ultimoDia = new Date(ano, indiceMes + 1, 0);

    // Adiciona os dias do mês anterior
    const primeiroDiaSemana = primeiroDia.getDay();
    const diasMesAnterior = new Date(ano, indiceMes, 0).getDate();

    for (let i = primeiroDiaSemana - 1; i >= 0; i--) {
      const dia = diasMesAnterior - i;
      const celula = document.createElement("div");
      celula.className = "day-cell other-month";
      celula.textContent = dia;
      celula.style.opacity = "0.5";
      grade.appendChild(celula);
    }

    // Adiciona os dias do mês atual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      const celula = document.createElement("div");
      celula.className = "day-cell";
      celula.textContent = dia;

      const lembretesDia = obterLembretesParaDia(ano, indiceMes, dia);
      if (lembretesDia.length > 0) {
        celula.style.backgroundColor = "#ff0057";
        celula.style.color = "white";
        celula.style.fontWeight = "bold";
      }

      celula.addEventListener("click", () => {
        if (lembretesDia.length > 0) {
          mostrarPopupLembretes(lembretesDia);
        } else {
          const anoFormatado = ano;
          const mesFormatado = (indiceMes + 1).toString().padStart(2, '0');
          const diaFormatado = dia.toString().padStart(2, '0');
          const dataFormatada = `${anoFormatado}-${mesFormatado}-${diaFormatado}`;
          const horaPadrao = "00:00";
          window.location.href = `PCriar.html?date=${dataFormatada}&time=${horaPadrao}`;
        }
      });

      grade.appendChild(celula);
    }

    // Adiciona os dias do próximo mês
    const ultimoDiaSemana = ultimoDia.getDay();
    const diasRestantes = 6 - ultimoDiaSemana;
    for (let dia = 1; dia <= diasRestantes; dia++) {
      const celula = document.createElement("div");
      celula.className = "day-cell other-month";
      celula.textContent = dia;
      celula.style.opacity = "0.5";
      grade.appendChild(celula);
    }

    conteudo.appendChild(grade);
    containerCalendario.appendChild(conteudo);
  }

  // Função para obter a chave do mês pelo índice
  function obterChaveMesPorIndice(indice) {
    return Object.keys(mapaMeses).find((chave) => mapaMeses[chave] === indice);
  }

  // Função para obter lembretes de um dia específico
  function obterLembretesParaDia(ano, indiceMes, dia) {
    return lembretes.filter(lembrete => {
      const dataLembrete = new Date(lembrete.date);
      return dataLembrete.getFullYear() === ano &&
             dataLembrete.getMonth() === indiceMes &&
             dataLembrete.getDate() === dia;
    });
  }

  // Função para mostrar o popup de lembretes
  function mostrarPopupLembretes(lembretesDia) {
    const overlay = document.getElementById('popup-overlay');
    const popup = document.getElementById('popup-container');
    const conteudo = document.getElementById('popup-content');

    let html = '';
    lembretesDia.forEach(lembrete => {
      html += `
        <div style="margin-bottom: 10px;">
          <p><strong>Título:</strong> ${lembrete.title}</p>
          <p><strong>Data:</strong> ${new Date(lembrete.date).toLocaleString()}</p>
          <p><strong>Descrição:</strong> ${lembrete.description || 'Sem descrição'}</p>
        </div>
        <hr style="border-color: #444;">
      `;
    });
    conteudo.innerHTML = html;

    overlay.style.display = 'block';
    popup.style.display = 'block';
  }

  // Função para fechar o popup de lembretes
  function fecharPopupLembretes() {
    document.getElementById('popup-overlay').style.display = 'none';
    document.getElementById('popup-container').style.display = 'none';
  }
});
