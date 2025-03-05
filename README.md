# Travel Tracker

![Exemplo de execução](image/image.png)

Travel Tracker é uma aplicação web que permite aos usuários registrar os países que visitaram. A lista de países é armazenada em um banco de dados PostgreSQL, e os países visitados são destacados em um mapa interativo.

## Tecnologias Utilizadas

- **Node.js** com **Express.js** para o backend
- **PostgreSQL** para armazenamento dos dados
- **EJS** para renderização do frontend
- **Body-parser** para processamento de requisições HTTP
- **HTML, CSS e JavaScript** para a interface do usuário

## Funcionalidades

- Adicionar países visitados por meio de um formulário
- Armazenar os países visitados no banco de dados
- Destacar no mapa os países registrados
- Exibir o número total de países visitados

## Como Executar o Projeto

### Pré-requisitos
- Node.js instalado
- PostgreSQL configurado com um banco de dados chamado `world`

### Configuração do Banco de Dados
1. Criar o banco de dados `world` no PostgreSQL.
2. Criar as tabelas necessárias:
   ```sql
   CREATE TABLE countries (
       id SERIAL PRIMARY KEY,
       country_code CHAR(2),
       country_name VARCHAR(100)
   );

   CREATE TABLE visited_countries (
       id SERIAL PRIMARY KEY,
       country_code CHAR(2)
   );
   ```
3. Popular a tabela `countries` utilizando os arquivos CSV localizados na pasta `csv-files`:
   ```sql
   COPY countries(country_code, country_name)
   FROM 'caminho/para/csv-files/countries.csv' DELIMITER ',' CSV HEADER;
   ```

### Instalação e Execução
1. Clonar o repositório:
   ```bash
   git clone https://github.com/Kiy0p0N/travel-tracker.git
   cd travel-tracker/code
   ```

2. Instalar as dependências:
   ```bash
   npm install
   ```

3. Iniciar o servidor:
   ```bash
   npm start
   ```

4. Acessar a aplicação no navegador:
   ```
   http://localhost:3000
   ```

## Exemplo de Uso
1. Digitar o nome de um país no campo de entrada.
2. Clicar no botão "Add".
3. O país será armazenado no banco de dados e destacado no mapa.
4. O contador será atualizado para refletir o número total de países visitados.