
Esta é uma extensão da documentação focada no **Módulo de Avaliações e Testes Psicológicos**. Integrar essas ferramentas ao sistema permite que o profissional acompanhe a evolução clínica através de dados quantitativos, além da análise qualitativa da IA.

---

# Documentação de Requisitos: Módulo de Avaliações Clínicas

## 1. Visão Geral

Este módulo permite a aplicação, correção automática (quando permitido) e o acompanhamento histórico de escalas e inventários psicológicos. O sistema deve suportar tanto a aplicação presencial quanto o envio de links para preenchimento remoto pelo paciente.

---

## 2. Catálogo de Testes e Escalas Integradas

Abaixo estão os instrumentos mais utilizados na prática clínica que podem ser digitalizados (respeitando os direitos autorais e normas do conselho):

### 2.1. Ansiedade e Depressão (Rastreio)

| Teste | Nome Extenso | Objetivo |
| --- | --- | --- |
| **PHQ-9** | Patient Health Questionnaire-9 | Rastreio e gravidade de sintomas depressivos. |
| **GAD-7** | Generalized Anxiety Disorder-7 | Rastreio de transtorno de ansiedade generalizada. |
| **BDI-II** | Inventário de Depressão de Beck | Medida de intensidade da depressão (uso restrito). |
| **BAI** | Inventário de Ansiedade de Beck | Medida de intensidade da ansiedade (uso restrito). |

### 2.2. Transtornos Específicos e Neurodivergência

| Teste | Nome Extenso | Objetivo |
| --- | --- | --- |
| **ASRS-18** | Adult ADHD Self-Report Scale | Rastreio de sintomas de TDAH em adultos. |
| **SNAP-IV** | Questionário de Sintomas de TDAH | Avaliação de TDAH e D.O.P em crianças/adolescentes. |
| **AQ-10** | Autism Spectrum Quotient | Rastreio rápido de traços de autismo em adultos. |
| **PCL-5** | Checklist do Transtorno de Estresse Pós-Traumático | Avaliação de sintomas de TEPT. |

### 2.3. Personalidade e Relacionamentos

| Teste | Nome Extenso | Objetivo |
| --- | --- | --- |
| **Big Five (BFI)** | Inventário dos Cinco Grandes Fatores | Avaliação de traços de personalidade. |
| **DAS** | Escala de Ajuste Diádico | Avaliação da qualidade da relação (ideal para Terapia de Casal). |
| **EPQR** | Questionário de Personalidade de Eysenck | Dimensões de Extroversão, Neuroticismo e Psicoticismo. |

---

## 3. Requisitos Funcionais do Módulo

### 3.1. Aplicação e Coleta

* **RF24 - Link de Preenchimento Remoto:** O psicólogo gera um link temporário e seguro para o paciente responder o teste de sua própria casa via celular/computador.
* **RF25 - Modo "Tablet de Consultório":** Interface simplificada para o paciente responder no dispositivo do profissional, bloqueando o acesso a outras áreas do sistema.
* **RF26 - Cronômetro Integrado:** Para testes que exigem tempo de resposta, o sistema deve registrar a latência de cada resposta.

### 3.2. Processamento e Resultados

* **RF27 - Cálculo de Escore Automático:** O sistema aplica a fórmula de soma ou média ponderada de cada teste instantaneamente após o envio.
* **RF28 - Classificação de Resultados:** Exibição automática do nível (ex: Mínimo, Leve, Moderado, Grave) com base nos manuais técnicos.
* **RF29 - Gráficos de Evolução (Timeline):** Plotagem de um gráfico de linhas comparando os resultados de um mesmo teste aplicado em datas diferentes (ex: PHQ-9 aplicado mensalmente).

### 3.3. IA aplicada aos Testes (Plano Pro)

* **RF30 - Análise de Inconsistência:** A IA deve sinalizar se o paciente respondeu de forma contraditória (ex: marcou "nunca" para tristeza, mas "sempre" para ideação negativa).
* **RF31 - Correlação Dinâmica:** A IA deve cruzar os resultados dos testes com as notas das sessões (ex: "O paciente teve um pico no GAD-7 na mesma semana em que relatou problemas no trabalho").

---

## 4. Segurança e Ética nos Testes

* **RF32 - Proteção de Gabaritos:** Os critérios de correção e pesos de cada pergunta não devem ser visíveis para o paciente em hipótese alguma.
* **RF33 - Assinatura do Profissional:** Todo relatório de teste gerado deve conter o selo/assinatura digital do psicólogo e seu número de registro (CRP).

---

## 5. Exemplo de Lógica de Cálculo (Score)

Para o **PHQ-9**, o sistema deve aplicar a seguinte lógica de pontuação baseada na soma das 9 questões (escala 0 a 3):

* **0 - 4:** Depressão Mínima
* **5 - 9:** Depressão Leve
* **10 - 14:** Depressão Moderada
* **15 - 19:** Depressão Moderadamente Grave
* **20 - 27:** Depressão Grave

---

### Próxima Etapa do Planejamento

Como você é um **Cientista da Computação**, o próximo passo lógico seria definir como essas tabelas de testes se relacionam com o paciente no banco de dados.

**Gostaria que eu gerasse o arquivo `schema.prisma` completo, contemplando as tabelas de `Patient`, `Session`, `Test` e `TestResponse` para suportar toda essa estrutura?**