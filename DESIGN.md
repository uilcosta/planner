# Meu Planner — O mês em foco

**Especificação de design para implementação · v1.0**  
Aplicação web responsiva · Português do Brasil · Real brasileiro (BRL)

## 1. Proposta

Transformar o Dashboard em um painel de decisão mensal. Ao abrir o Meu Planner, a pessoa deve conseguir responder três perguntas em sequência: **quanto tenho disponível, como estão meus gastos e qual foi a última movimentação?** A ação principal será **Novo lançamento**, acessível a partir de qualquer tela de trabalho.

Na tela de referência, **Nova conta** e **Nova caixinha** competem pelo destaque, três cartões repetem destinos do menu e os percentuais dos indicadores exibem pouca informação sobre o período comparado. A proposta leva as ações de cadastro para suas áreas, troca os atalhos repetidos por informações sobre fluxo e planejamento e identifica o período de cada comparação.

**Escopo da primeira entrega:** Dashboard, Lançamentos e padrões de interação reaproveitáveis em Contas, Caixinhas, Planejamento, Categorias e Instituições. A referência visual é a captura fornecida. As regras de saldo e os fluxos abaixo são decisões propostas para o redesign e devem ser confrontados com o modelo de dados do projeto durante a integração.

## 2. Arquitetura e navegação

| Área | Conteúdo principal | Ação local |
| --- | --- | --- |
| Dashboard | Resumo, fluxo de caixa, acompanhamento do orçamento e atividade recente | Novo lançamento |
| Lançamentos | Lista com busca, filtros de período, tipo, conta e categoria | Novo lançamento |
| Contas | Contas, saldos e movimentações por conta | Nova conta |
| Caixinhas | Reservas, metas e aportes | Nova caixinha |
| Planejamento | Limite mensal, gastos por categoria e saldo do orçamento | Definir orçamento |
| Categorias | Categorias de entrada e saída | Nova categoria |
| Instituições | Instituições vinculadas às contas | Nova instituição |
| Preferências | Tema e opção de ocultar valores | Salvar preferências quando necessário |

- **Desktop:** barra lateral com **Novo lançamento**, destinos principais e grupo **Mais** para Categorias, Instituições e Preferências. O item atual tem fundo, indicador e `aria-current="page"`.
- **Tablet:** trilho lateral de ícones com nomes acessíveis e rótulos em foco ou hover. Um botão de menu abre a lista com os rótulos visíveis e a ação **Novo lançamento**.
- **Celular:** barra inferior com **Início**, **Lançamentos**, **Contas** e **Mais**. Mais abre um painel com Novo lançamento, Caixinhas, Planejamento, Categorias, Instituições e Preferências. **Novo lançamento** é um botão no cabeçalho do Dashboard e de Lançamentos. Em telas estreitas pode exibir **Lançar**, com nome acessível **Novo lançamento**.
- **Período:** seletor de mês no Dashboard, em Lançamentos e em Planejamento. Persista a seleção ao navegar entre essas áreas e inicialize no mês atual quando não houver seleção. Setas mudam um mês por vez, com nomes acessíveis **Mês anterior** e **Próximo mês**. Selecionar o rótulo abre seleção de mês e ano com a opção **Mês atual**. Na lista, use parâmetros de URL para preservar período e filtros ao voltar. Se o gráfico ou a lista abrir um recorte do Dashboard, a lista recebe os filtros correspondentes.

## 3. Dashboard

| Ordem | Bloco | Conteúdo e interação |
| --- | --- | --- |
| 1 | Cabeçalho | Título **Dashboard**, botão **Novo lançamento**, seletor de período e alternância **Ocultar valores** |
| 2 | Indicadores | **Disponível**, **Em caixinhas**, **Entradas do mês** e **Saídas do mês**. Cada cartão tem título, valor e informação contextual. Ações têm rótulo explícito, por exemplo **Ver entradas** |
| 3 | Fluxo de caixa | Barras agrupadas de entradas e saídas por semana. Mostrar legenda, escala em reais e acesso **Ver dados** para a tabela equivalente |
| 4 | Planejamento | Consumo do orçamento mensal, valor restante ou excedente e até três categorias com maior percentual utilizado. Link **Ver planejamento** |
| 5 | Atividade recente | Até cinco movimentações do mês em ordem decrescente. Cada item abre detalhes. **Ver todos os lançamentos** preserva o mês |

### Composição por largura

| Largura da janela | Estrutura | Arranjo do Dashboard |
| --- | --- | --- |
| 320–479 px | Barra inferior, cabeçalho flexível, margens de 16 px | Indicadores em uma coluna. Fluxo, Planejamento e Atividade empilhados |
| 480–767 px | Barra inferior e margens de 16 px | Indicadores 2 × 2. Demais blocos empilhados |
| 768–1199 px | Trilho de 72 px e margens de 24 px | Indicadores 2 × 2. Demais blocos empilhados |
| ≥ 1200 px | Barra lateral de 232 px e margens de 24 px | Quatro indicadores lado a lado. Fluxo e Planejamento em proporção 2:1. Atividade ocupa toda a largura |

A área de conteúdo tem largura máxima de 1440 px, centralizada no espaço restante. Use grids com colunas flexíveis e permita que rótulos e valores quebrem linha. A 320 px e com zoom, os controles devem refluir, números devem permanecer legíveis e a página deve evitar rolagem horizontal. Reserve espaço para a barra inferior e para a área segura do dispositivo.

### Regras para leitura dos valores

| Informação | Regra proposta |
| --- | --- |
| Disponível | Soma dos saldos das contas incluídas no Dashboard menos as reservas mantidas nessas mesmas contas. Quando houver reservas em contas separadas do total original, trate-as na origem para evitar desconto duplo |
| Em caixinhas | Total reservado nas caixinhas vinculadas às contas incluídas. Exiba valores sem meta normalmente. O progresso de uma meta aparece apenas quando houver meta definida |
| Data dos saldos | Mês atual mostra posição até hoje. Mês encerrado mostra posição no fechamento. Para um mês futuro, exiba **Posição ainda indisponível** |
| Entradas e Saídas | Somam lançamentos efetivados dentro do recorte do mês, até hoje no mês atual. Transferências entre contas incluídas e aportes ou resgates de caixinhas ficam fora dos totais de receita e despesa |
| Comparação dos fluxos | Em mês encerrado, compare com o mês anterior completo. No mês em andamento, compare até o mesmo dia do mês anterior, limitado ao último dia daquele mês. Com base anterior zero ou indisponível, omita o percentual e use **Sem base de comparação** |
| Planejamento | Mostre **R$ X de R$ Y usados** e **R$ Z disponíveis no orçamento** ou **R$ Z acima do orçamento**. A barra satura em 100%, e o texto preserva o percentual real. Marque **Próximo do limite** entre 80% e menos de 100%, **Limite atingido** em 100% e **Acima do limite** acima de 100%. Sem orçamento, use **Definir orçamento** |
| Fluxo semanal | Agrupe por semana civil de segunda a domingo, recortada aos limites do período. A tabela alternativa traz o intervalo e os dois totais por semana, inclusive semanas sem movimentação até a data de corte |
| Datas e valores | Datas em `dd/MM/aaaa`, meses em português e valores como **R$ 1.250,00**. Calcule valores monetários em centavos inteiros e formate no locale `pt-BR`. Mostre sinal e rótulo do tipo em movimentações |

Exemplo fictício: contas com **R$ 12.450,00** e caixinhas de **R$ 3.200,00** já incluídas nesse saldo resultam em **R$ 9.250,00 disponíveis**. Um aporte interno de **R$ 300,00** leva o disponível a **R$ 8.950,00** e as caixinhas a **R$ 3.500,00**, com o total das contas em **R$ 12.450,00**.

**Ocultar valores** mascara números financeiros em cartões, lançamentos, eixos, tabelas, tooltips, toasts e nomes acessíveis. A preferência persiste na próxima sessão. O campo de valor de um formulário continua visível durante seu preenchimento.

## 4. Lançamentos e fluxos

A lista exibe descrição, data, tipo, conta, categoria quando aplicável e valor. No desktop, use tabela com cabeçalhos. No celular, use lista vertical com descrição e valor na primeira linha e metadados abaixo. Filtros aparecem em linha quando houver espaço e em painel no celular. Mostre a quantidade de filtros ativos e permita limpar filtros de busca, tipo, conta e categoria sem alterar o mês selecionado.

### Novo lançamento

1. Abra **Novo lançamento**, com **Despesa** pré-selecionada. Opções **Despesa**, **Receita** e **Transferência** ficam visíveis.
2. Exiba valor, data, descrição, conta e categoria para receita ou despesa. Para transferência, exiba valor, data, descrição, conta de origem e conta de destino. Valor, data e contas são obrigatórios. Categoria é obrigatória para receita ou despesa, com opção **Sem categoria** para quem deseja classificar depois. Descrição é opcional. Preencha a data com hoje para um novo lançamento e mostre a data efetiva no campo antes de salvar.
3. Valide valor maior que zero, data válida, contas ativas e origem diferente do destino. Nesta entrega, aceite lançamentos efetivados até hoje. Ao tentar enviar, marque campos inválidos e leve o foco ao primeiro erro. Exemplos: **Informe um valor maior que zero.** e **Selecione outra conta de destino.**
4. Após salvar, feche o formulário, atualize os totais e a atividade afetados e confirme com **Lançamento registrado**. Se a data estiver fora do período exibido, mantenha o recorte atual e ofereça **Ver lançamento** no toast. A mesma ação fica disponível na lista por meio da busca e do período do registro.
5. Em falha de rede, mantenha os campos e exiba **Não foi possível confirmar o lançamento. Tente novamente.** Use a mesma chave de idempotência para repetir a mesma tentativa quando a confirmação for incerta. Uma transferência deve salvar as duas pontas em uma única operação.

### Edição, exclusão e cadastros

- **Detalhes:** abrir item mostra os dados e ações **Editar** e **Excluir lançamento**. Editar reaproveita o formulário com valores preenchidos. Se mudar a data ou a conta, atualize os recortes de origem e destino após confirmação.
- **Exclusão:** confirmação mostra a descrição do item ou, se vazia, seu tipo e data. Explique **Os saldos e totais vinculados serão recalculados.** Para transferência, informe que a operação será removida das duas contas. Após uma exclusão bem-sucedida, leve o foco ao item seguinte, ao anterior se não houver seguinte, ou ao título da lista se ficar vazia.
- **Nova conta:** nome, tipo, instituição opcional e saldo inicial com data de referência. O saldo inicial estabelece a posição da conta e fica fora das entradas do mês. Se ainda não houver conta, ofereça **Criar conta** como ação para habilitar lançamentos.
- **Nova caixinha:** nome e meta opcional. Registre aporte ou resgate em um fluxo separado com conta, valor e data, para que o efeito sobre o disponível seja explícito. O formulário de movimentação da caixinha deve indicar **Disponível após a operação** antes de confirmar.
- **Definir orçamento:** valor maior que zero e mês, com categorias opcionais no detalhamento. Recupere edição existente do mês sem criar dois orçamentos para o mesmo período.

## 5. Sistema visual

Use superfícies neutras, bordas finas e sombras discretas em elementos flutuantes. Azul concentra a ação primária e a seleção. Verde e vermelho comunicam o sentido financeiro em conjunto com ícone, sinal ou texto. A saída de dinheiro é uma direção da movimentação, enquanto o estado de erro traz mensagem e ícone próprios.

| Token semântico | Claro | Escuro | Aplicação |
| --- | --- | --- | --- |
| `background` | `#F5F7FB` | `#0B1220` | Fundo da aplicação |
| `surface` | `#FFFFFF` | `#111B2C` | Cartões, cabeçalhos e painéis |
| `text` | `#101828` | `#F1F5F9` | Texto principal |
| `text-muted` | `#475569` | `#B4C1D4` | Texto auxiliar |
| `border` | `#DCE3EC` | `#344259` | Divisórias e cartões |
| `control-border` | `#64748B` | `#8091AB` | Limites de campos e controles |
| `primary` | `#1D4ED8` | `#93C5FD` | Ação, link e seleção |
| `on-primary` | `#FFFFFF` | `#0B1220` | Texto em botão primário |
| `positive` | `#047857` | `#6EE7B7` | Entradas e sucesso |
| `negative` | `#B42318` | `#FDA4AF` | Saídas e erros |
| `warning` | `#92400E` | `#FCD34D` | Orçamento próximo do limite |
| `focus` | `#1D4ED8` | `#93C5FD` | Contorno externo de 2 px com afastamento |

- **Tipografia:** Inter com fallback de sistema. Título 28/36 px em desktop e 24/32 px em celular. Título de seção 18/26 px, corpo 16/24 px, auxiliar 14/20 px e valores 24/32 px com algarismos tabulares e peso 650–700.
- **Espaçamento:** 4, 8, 12, 16, 24, 32 e 48 px. Cartões com raio 16 px e padding de 16–24 px. Controles com raio 10 px. Use ícones lineares de 20 px com área de interação de pelo menos 44 × 44 px.
- **Componentes:** um botão primário por contexto de tarefa. Secundários usam borda ou tratamento textual. Hover, foco, pressionado, desabilitado e carregando têm visuais próprios. O carregamento mantém o espaço do rótulo para evitar salto de layout.
- **Gráfico:** combine cores contrastantes com posição fixa de série e padrão de preenchimento distinto. Exiba referência zero e escala suficiente para comparar as barras. Disponibilize os mesmos valores por toque e teclado, além da tabela.
- **Movimento:** transições de 140–200 ms para menus e feedback. Respeite `prefers-reduced-motion` com mudanças imediatas ou sem deslocamento. Tema inicial segue o sistema, com opção persistente de claro ou escuro.

## 6. Modais e painéis

| Cenário | Desktop e tablet | Celular | Ações |
| --- | --- | --- | --- |
| Novo ou editar lançamento, conta, caixinha ou orçamento | Modal central com largura máxima de 560 px e altura limitada à janela | Diálogo de tela cheia com cabeçalho e ações visíveis durante a rolagem | **Cancelar** e **Salvar** |
| Detalhe de lançamento | Painel lateral modal de até 480 px | Painel de tela cheia | **Editar** e **Excluir lançamento** |
| Confirmar exclusão | Modal central de até 440 px | Diálogo compacto acima da área segura | **Cancelar** e **Excluir lançamento** |
| Selecionar mês, filtrar ou acessar Mais | Popover ancorado quando houver espaço | Painel inferior com título e botão **Fechar** | **Aplicar filtros**, **Limpar** ou seleção direta do destino, conforme o caso |

- Cada superfície modal tem título associado, foco inicial visível e navegação por Tab contida. Em confirmação destrutiva, foque **Cancelar**. Em formulários móveis, foque o título na abertura para evitar disparar o teclado antes de a pessoa escolher um campo.
- Feche com botão **Fechar**, **Cancelar** ou Escape quando não houver gravação em curso. Ao tentar fechar um formulário alterado, mostre no mesmo diálogo **Descartar alterações?** com **Continuar editando** e **Descartar**. Mantenha os dados até a confirmação.
- O conteúdo ao fundo fica inerte enquanto o modal estiver aberto. Permita rolagem interna e mantenha as ações acessíveis quando o teclado virtual estiver ativo. Ao sair, devolva o foco ao acionador ou ao elemento lógico mais próximo se o acionador tiver desaparecido.
- Durante o envio, mostre **Salvando…** ou **Excluindo…**, bloqueie reenvio e comunique erros no próprio diálogo. Se o envio expirar, restaure os controles e preserve o conteúdo preenchido.

## 7. Toasts e outros retornos

| Evento | Mensagem | Comportamento |
| --- | --- | --- |
| Criação ou edição confirmada | **Lançamento registrado** ou **Lançamento atualizado** | 5 s, com **Ver lançamento** quando precisar localizar o registro fora do período atual |
| Remoção confirmada | **Lançamento excluído** | 5 s, após recalcular os indicadores afetados |
| Dados do painel falharam | **Não foi possível atualizar o painel** | Fixar até dispensar ou tentar novamente, com ação **Tentar novamente** e erro também no bloco afetado |
| Formulário inválido ou falha de gravação | **Confira os campos destacados** ou mensagem específica da falha | Erro persistente no formulário, associado ao campo ou ao envio |

No desktop, posicione a pilha no canto inferior direito. No celular, posicione-a acima da barra de navegação e da área segura. Limite a dois avisos visíveis, agrupe repetições e mantenha o foco onde está. Use uma região viva com `aria-live="polite"` para confirmações e avisos informativos. Pause a contagem em hover ou foco, inclua botão **Dispensar aviso** e mantenha ações importantes acessíveis na própria tela. Avisos não devem cobrir o campo ativo ou os botões de um diálogo.

### Estados de tela

| Estado | Comportamento |
| --- | --- |
| Carregamento inicial | Esqueletos com o tamanho dos componentes finais. Identifique a região em carregamento sem anunciar cada cartão |
| Troca de período | Mostre o novo mês e o carregamento no bloco. Atualize os dados apenas com a resposta correspondente à seleção mais recente |
| Primeiro uso | **Crie uma conta para começar** com **Nova conta**. Use traço para valores indisponíveis |
| Mês sem movimentação | Mostre **R$ 0,00** para totais conhecidos e **Nenhum lançamento neste mês** na lista. Preserve os saldos de contas existentes |
| Filtros sem resultado | **Nenhum lançamento com estes filtros** com **Limpar filtros** |
| Falha parcial | Mensagem com **Tentar novamente** no bloco afetado. Se houver dados em cache do mesmo período, identifique **Última atualização às HH:mm** |
| Sem conexão | Indicação **Você está offline**. Preserve o formulário. Confirme a operação apenas após retorno do servidor |

## 8. Acessibilidade e qualidade

- Adote WCAG 2.2 AA como meta de implementação. Valide contraste de pelo menos 4,5:1 para texto comum e 3:1 para texto grande e componentes visuais aplicáveis. Teste estados de foco, seleção e erro nos dois temas.
- A ordem de foco acompanha a ordem de leitura. Inclua **Pular para o conteúdo**, títulos hierárquicos, rótulos visíveis e nomes acessíveis para botões de ícone. Associe erros de campo com `aria-describedby` e indique invalidez com `aria-invalid`.
- Teste cabeçalho fixo, barra inferior, modais, toasts e teclado virtual juntos. Nenhum deles deve ocultar o foco. Botões e mensagens permanecem compreensíveis com zoom e ajuste do tamanho de fonte.
- Use texto, símbolos e padrão visual em gráficos e estados. Ofereça tabela equivalente ao fluxo de caixa. Com valores ocultos, mantenha o estado visível para tecnologias assistivas sem expor os números.
- Retenha formulário quando houver falha. Se o servidor confirmar a gravação, mas a atualização do painel falhar, mostre a confirmação do registro e permita atualizar apenas o painel. Uma falha de atualização não deve solicitar novo envio da gravação.

## 9. Ordem de implementação e aceite

**1. Base:** tokens de tema, navegação responsiva, seletor de período e componentes de modal, formulário e toast.  
**2. Jornada principal:** Dashboard com agregações, lista de lançamentos e fluxos de criar, editar, transferir e excluir.  
**3. Integração:** aplicar os padrões a Contas, Caixinhas e Planejamento e validar estados de erro, teclado e privacidade.

- [ ] Dashboard validado em 320, 390, 480, 768, 1024, 1200 e 1440 px, com zoom e teclado virtual.
- [ ] Navegação e modais funcionam por teclado, com foco visível, retorno ao acionador e proteção contra descarte acidental.
- [ ] Criar, editar e excluir um lançamento atualiza o Dashboard e a lista no recorte correto, inclusive quando a edição muda o mês.
- [ ] Aporte, resgate e transferência preservam a consistência dos saldos. Um envio repetido após timeout gera uma única operação.
- [ ] Orçamento vazio, no limite e acima do limite apresenta mensagens distintas e legíveis.
- [ ] Mês atual, encerrado e futuro exibem as datas e os estados definidos. Comparações com base zero deixam o percentual em branco e mostram o texto previsto.
- [ ] Os dois temas mantêm contraste. Ocultar valores também protege tooltips, toasts e conteúdo anunciado pelo leitor de tela.
- [ ] Erros de rede preservam dados preenchidos. Após gravar com sucesso, falhas na recarga do painel podem ser recuperadas sem duplicar o lançamento.
