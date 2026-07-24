# Marvel Reading Club — Time Runs Out & Secret Wars

Webapp simples (HTML + CSS + JS puro, sem build) para acompanhar a leitura
partilhada dos 4 Omnibus + Secret Wars. Pensada para ser publicada no
**GitHub Pages** só com o `index.html` na raiz — não precisa de servidor,
Node, nem build step.

## Como publicar no GitHub Pages

1. Cria um repositório novo (ex: `marvel-reading-club`) e faz upload destes
   4 ficheiros para a raiz: `index.html`, `styles.css`, `app.js`, `data.js`.
2. No repositório: **Settings → Pages → Build and deployment → Source:
   Deploy from a branch**, escolhe o branch `main` e a pasta `/ (root)`.
3. Guarda. Ao fim de 1-2 minutos a app fica disponível em
   `https://<o-teu-user>.github.io/<nome-do-repo>/`.

Não há passos extra: é literalmente "git push" + ativar o Pages.

## Como funciona a "base de dados"

Não há servidor próprio — mas agora há duas camadas:

1. **Capítulos e livros** (`data.js`): a lista fixa dos 155 números, gerada a
   partir do teu Excel, partilhada por todos. Para editar no futuro, basta
   mudar o array `CHAPTERS` neste ficheiro e fazer commit.
2. **Leitores e progresso** (`club-data.json`, **novo ficheiro**, criado
   automaticamente no teu repositório GitHub na primeira sincronização):
   contém a lista de leitores (nome + password) e o progresso de cada um.
   Este ficheiro é a "verdade" partilhada — quando um dispositivo liga a
   sincronização, lê este ficheiro do GitHub e passa a escrever nele sempre
   que alguém marca um capítulo, muda de password ou cria um novo leitor.
   Sem sincronização configurada, tudo continua a funcionar apenas com
   `localStorage` (modo "só este dispositivo", como antes).

### Como ativar a sincronização entre dispositivos

Toca na barra **"📴 Sem sincronização"** no topo da app e preenche:

1. **Repositório**: `o-teu-user/nome-do-repo` (o mesmo onde publicaste o site).
2. **Ramo**: normalmente `main`.
3. **Personal Access Token do GitHub**, criado assim:
   `GitHub → Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token`, escolhendo:
   - **Repository access**: só o repositório do reading club (não "All repositories").
   - **Permissions**: `Contents` → `Read and write`. Nada mais é necessário.

Depois de guardares, a app cria (ou lê, se já existir) o `club-data.json`
no repositório e passa a mostrar "☁️ Sincronizado com o GitHub". Repete este
passo em cada dispositivo/browser que quiseres ligar aos mesmos dados —
todos passam a ler e escrever o mesmo ficheiro.

⚠️ **Importante sobre o token — isto é segurança a sério, ao contrário das
passwords dos leitores:**
- O token fica guardado em **texto simples no `localStorage`** desse
  browser. Quem tiver acesso a esse dispositivo/browser (ou souber abrir as
  ferramentas de developer) consegue ler o token.
- Por isso usa sempre um **token "fine-grained" limitado só a este
  repositório**, com a permissão mínima (`Contents: Read and write`) — assim,
  mesmo que o token vaze, o dano possível é escrever neste repositório, nunca
  na tua conta toda.
- Se o repositório for **público**, o `club-data.json` (nomes dos leitores,
  password ligeiramente disfarçada, progresso de leitura) fica visível a
  qualquer pessoa que veja o repositório — não é informação sensível a
  sério, mas fica registado no histórico do git.
- Podes revogar o token a qualquer momento em
  `GitHub → Settings → Developer settings → Personal access tokens`, e criar
  um novo depois.

Se preferires não usar um token de todo, a app funciona perfeitamente sem
sincronização — cada dispositivo guarda o progresso só localmente.

### Se a sincronização não ligar

Havia três problemas que causavam exatamente "demora muito tempo e não liga" — já corrigidos:

1. **A app ficava à espera da rede antes de mostrar seja o que for.** Agora
   mostra sempre logo os dados guardados neste dispositivo, e só depois tenta
   ligar-se ao GitHub em segundo plano — nunca mais fica com a página em
   branco à espera.
2. **Sem limite de tempo nos pedidos.** Um pedido lento podia ficar preso
   quase indefinidamente. Agora há um limite de 12 segundos: se o GitHub não
   responder a tempo, aparece logo um erro claro em vez de ficar "a
   sincronizar…" para sempre.
3. **Erros genéricos e configuração inconsistente.** Se a ligação falhasse a
   meio, o token ficava guardado na mesma, e a app voltava a tentar (e a
   falhar) em todos os arranques seguintes. Agora só guarda a configuração
   depois de confirmar que funciona de facto, e mostra a razão real do erro
   (token inválido, repositório não encontrado, ramo errado, sem permissão de
   escrita, sem ligação à internet) — toca na barra de sincronização para ver
   a mensagem exata.

Se depois disto continuar a falhar, os motivos mais comuns são:

- **Token sem permissão** → confirma que é um token "fine-grained" com
  `Contents: Read and write` **para este repositório específico**.
- **Ramo errado** → repositórios mais antigos usam por vezes `master` em vez
  de `main`. Confirma no GitHub, no separador de ficheiros do repositório.
- **Repositório mal escrito** → tanto faz escrever `utilizador/repo` como
  colar o link completo `https://github.com/utilizador/repo`.

### Limitações a saber

- Cada marcação de "Lido" gera um **commit** no repositório (com uma pequena
  pausa de ~1,2s a agrupar cliques seguidos para não gerar um commit por
  clique). Para um grupo pequeno de amigos isto é perfeitamente aceitável;
  para muita gente a marcar ao mesmo tempo, o histórico do git cresce depressa.
- Se dois dispositivos escreverem exatamente ao mesmo tempo, ganha o último
  que gravar (last-write-wins) — a app tenta uma segunda vez automaticamente
  se detetar esse conflito, mas não faz merge inteligente das duas alterações.
- A app volta a ler o GitHub sempre que voltas a esta aba/janela (ex: trocas
  de app e voltas), para apanhar alterações feitas noutro dispositivo
  entretanto.

## Passwords já definidas

| Leitor  | Password   |
|---------|------------|
| André   | `andre123`  |
| Filipe  | `filipe123` |
| Duarte  | `duarte123` |

São passwords **simples de propósito** (só para evitar que alguém marque
capítulos de outra pessoa sem querer) — não é segurança "a sério", o hash
usado é só ofuscação, não criptografia. Qualquer um destes leitores pode
mudar a password no futuro editando o `localStorage` (ou eu adiciono um botão
para isso, se quiseres).

## Alterar password

Com uma tab ativa (já com sessão iniciada), aparece um link **"🔑 Alterar
password"** por baixo das tabs. Pede a password atual + a nova (duas vezes)
e atualiza o `localStorage` desse leitor.

⚠️ Repetindo o aviso que também aparece no modal: isto **não é segurança a
sério**. A password fica só ligeiramente disfarçada (uma função de hash
simples tipo checksum, não criptografia) dentro do `localStorage` do browser
— serve apenas para os leitores não mexerem no progresso uns dos outros por
engano. Não uses aqui uma password que uses noutro sítio importante.

## Adicionar mais leitores

Basta clicar no separador **"＋ Novo"** no topo da lista de tabs, escolher
nome e password. Fica guardado no browser de quem o criou — se quiseres que
o novo leitor apareça também nos outros telemóveis/computadores, cada pessoa
tem de criar o mesmo leitor (mesmo nome) no seu próprio browser, ou combinamos
uma password fixa.

## Estrutura

```
index.html       → estrutura da página (tabs, filtros, modals)
styles.css       → design (estilo "banda desenhada": ink outlines, halftone, stamps)
app.js           → lógica: leitores, progresso, vistas, i18n, sincronização GitHub
data.js          → os 155 capítulos + metadados dos 5 livros (estático)
club-data.json   → criado automaticamente na 1ª sincronização: leitores + progresso
```

## Vistas por leitor

- **Próximos** (default): capítulos ainda não marcados como lidos, agrupados
  por Livro, com destaque para o "a seguir na pilha".
- **Histórico**: só os já marcados como lidos.
- **Todos**: lista completa, lidos e por ler.

## Idioma

Botões **PT / EN** no canto superior direito — traduz toda a interface
(pt-PT / en-GB). Os títulos das edições (nomes das revistas) mantêm-se no
original, como no Excel.
