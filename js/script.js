const $ = (tag) => document.querySelector(tag)

const cnv            = $('canvas')
cnv.width            = innerWidth
cnv.height           = innerHeight
const ctx            = cnv.getContext ('2d')
const fossadoTiro    = 4
const txtPontos      = $('#txtPontuação')
const gameoverModal  = $('#gameoverModal')
const pontuaçãoFinal = $('#pontuaçãoFinal')
const btnJogardeNovo = $('#btnJogardeNovo')
const startModal     = $('#startModal')
const startContainer = $('#startContainer')
const fundo          = $('#fundo')
      fundo.volume   = .18
const MORTE          = 1
const TIRO           = 2

let bala              = []
let malfeitores       = []
let pedasso           = []
let intervaloID
let animaid
let pontos            = 0

//CLASSES
//classe para definir os parametros dos desenhos a serem feitos
class Desenho {
    constructor(x, y, radius, color) {
        this.x      = x;
        this.y      = y;
        this.radius = radius;
        this.color  = color;
    }

    draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
        ctx.fillStyle = this.color
        ctx.fill()
    }
}

//classe para desenhar o projétil e o metodo para tal herdando da class "Desenho"
class Balas extends Desenho{
    constructor(x,y,radius,color,forssa){
        super(x,y,radius,color)
        this.forssa = forssa
    }
    atualizar(){
        this.draw()
        this.x += this.forssa.x
        this.y += this.forssa.y
    }
}

//classe para desenhar as esferas qeu giram em torno do personagem e o metodo para tal herdando da class "Desenho"
class Bolas extends Desenho{
    constructor(x,y,radius,color, anguloP,jogador){
        super(x,y,radius,color)
        this.anguloP  = anguloP
        this.jogador  = jogador
        this.angulo   = 0
    }
    atualizar(){
        this.draw()
        this.angulo += this.anguloP
        if(Math.abs(this.angulo) >= Math.PI*2){
            this.angulo = 0
        }
        this.x = this.jogador.x + Math.cos(this.angulo) * this.jogador.radius
        this.y = this.jogador.y + Math.sin(this.angulo) * this.jogador.radius
    }
}

//classe para desenhar o personagem juntamente com as esferas herdando da classe Desenho
class Jogador extends Desenho{
    constructor(x,y,radius,color){
    super(x,y,radius,color)
    this.meiota = radius/5
    this.b1     = new Bolas(
        this.x + Math.cos(0) * this.radius,
        this.y + Math.sin(0) * this.radius,
        2, '#0000ff', .08, this)

    this.b2     = new Bolas(
            this.x + Math.cos(0) * this.radius,
            this.y + Math.sin(0) * this.radius,
            2, '#cc0099', -.08, this) 
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.meiota, 0, Math.PI*2, false)
        ctx.strokeStyle = this.color
        ctx.stroke()
    }
    atualizar(){
        this.draw()
        this.b1.atualizar()
        this.b2.atualizar()
    }
}

//classe para desenhar os inimigos herdando da classe Balas juntamente com o metodo para os inimigos diminuirem de tamanho apos a colisão com o projetil
class MalFeitores extends Balas{
    constructor(x,y,radius,color,forssa){
        super(x,y,radius,color,forssa)
        this.newRadius = radius
    }

    draw(){
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        ctx.strokeStyle = this.color
        ctx.stroke()
    }

    shrink(){
        if(this.newRadius < this.radius){
            this.radius -= .5
        }
    }

    atualizar(){
        this.shrink()
        this.draw()
        this.x += this.forssa.x
        this.y += this.forssa.y
    }
}

//classe para desenhar as particulas herdando da classe Balas 
class Pedassos extends Balas{
    constructor(x,y,radius,color,forssa){
        super(x,y,radius,color,forssa)
        this.alpha = 1
    }

    draw(){
        ctx.save()
        ctx.globalAlpha = this.alpha
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius,0,Math.PI*2, false)
        ctx.fillStyle = this.color
        ctx.fill()
        ctx.restore()
    }

    atualizar(){
        this.draw()
        this.alpha    -= .01
        this.x        += this.forssa.x
        this.y        += this.forssa.y
        this.forssa.x *= .99
        this.forssa.y *= .99
    }
}

//CLASSES


const jogador = new Jogador(cnv.width/2, cnv.height/2, 30, '#800080'); //cria o player

addEventListener('click', (e)=>{
    e.preventDefault()
    tocaCantiga(TIRO)
    const angulo = Math.atan2(e.clientY - jogador.y, e.clientX - jogador.x)
    const velocidade = {
        x: Math.cos(angulo) * fossadoTiro,
        y: Math.sin(angulo) * fossadoTiro
    }
    bala.push(new Balas(jogador.x, jogador.y, 3, '#FFFF00', velocidade))
})
startContainer.addEventListener('click', ()=>{

    startModal.style.opacity = 0
    setTimeout(() =>{
        startModal.style.zIndex  = -1
    }),500

    jogardeNovo()
})

btnJogardeNovo.addEventListener('click', jogardeNovo)
 

// FUNÇÔES
// cria inimigos
function botaMalfeitores(){
    intervaloID = setInterval(()=>{

        const radius = Math.floor(Math.random()*26) + 5

        let posX, posY
        if(Math.random() < .5){
            posX = Math.random() < .5 ? 0 - radius : cnv.width + radius
            posY = Math.random() * cnv.height
        }
        else{
            posX = Math.random() * cnv.width
            posY = Math.random() < .5 ? 0 - radius : cnv.height + radius
        }

        const rumo = Math.atan2(jogador.y - posY, jogador.x - posX)
        const forssa = {
            x: Math.cos(rumo),
            y: Math.sin(rumo)
        }

        const color = 'hsl('+ Math.random() * 359 + ', 100%, 50%)'

        malfeitores.push(new MalFeitores(posX, posY, radius, color, forssa))
    },1500)
}

// função loop
function loop(){
    animaid = requestAnimationFrame (loop,cnv)
    atualizar()
}

//atualiza e chama as funções de checagem
function atualizar (){
    ctx.fillStyle = 'rgba(0,0,0,.1)'
    ctx.fillRect(0,0,cnv.width,cnv.height)
    
    pulissa()
    checaeprexecaBala()
    checaBagasso()
    jogador.atualizar()
}

//checa se o inimigo saiu da tela ou foi derrotado para exclui-lo
function pulissa(){
    malfeitores.forEach((inimigo) =>{
        inimigo.atualizar()

        const lonjura = Math.hypot(jogador.x - inimigo.x, jogador.y - inimigo.y)

    if(lonjura < jogador.radius + inimigo.radius){
        fim()
    }
    })
}

//pausa o jogo e chama a tela de game over
function fim(){

    fundo.pause()
    fundo.currentTime = 0

    cancelAnimationFrame(animaid)
    clearInterval(intervaloID)
    pontuaçãoFinal.innerText    = pontos
    gameoverModal.style.opacity = 1
    gameoverModal.style.zIndex  = 1
}

//retira a tela de game over e recomeça o jogo
function jogardeNovo(){

    fundo.play()

    gameoverModal.style.opacity = 0
    gameoverModal.style.zIndex  = -1
    bala                        = []
    pedasso                     = []
    malfeitores                 = []
    pontos                      = 0
    txtPontuação.innerText = 'PONTOS: ' + pontos
    loop()
    botaMalfeitores()
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, cnv.width, cnv.height)

}

//função para tocar musica
function tocaCantiga(somType){
    const som = document.createElement('audio')
    som.src = somType === MORTE ? './cantigas/morte.mp3' : './cantigas/tiro.mp3'
    som.addEventListener('canplaythrough', () =>{
        som.play()
    })
}

//colisao da bala no inimigo
function checaeprexecaBala(){
    for(let i = bala.length -1; i >=0; i-- ){
        const p = bala [i]
        p.atualizar()
        checaseJaFoi(p, i)

        for   (let eIndex = malfeitores.length -1; eIndex >= 0; eIndex--){
            const inimigo = malfeitores[eIndex]
            const lonjura = Math.hypot(p.x - inimigo.x, p.y - inimigo.y)
            if(lonjura < p.radius + inimigo.radius){

                tocaCantiga(MORTE)

                if(inimigo.radius > 15){
                    inimigo.newRadius = inimigo.radius -10
                }else{
                    malfeitores.splice(eIndex,1)
                }
                
                pontos += 40 - Math.floor(inimigo.radius)
                txtPontos.innerText = 'PONTOS: ' + pontos

                bala.splice(i,1)
                bagassar(inimigo,p)
            }
        }
    }
}

//checa se o tiro ainda esta em tela para exclui-lo do array
function checaseJaFoi(balas, index){
    if(balas.x + balas.radius < 0||
       balas.x + balas.radius > cnv.width||
       balas.y + balas.radius < 0||
       balas.y + balas.radius > cnv.height)
       {

        pontos -= 15
        if(pontos <= 0){
            pontos = 0
        }

        txtPontos.innerText = 'PONTOS: ' + pontos

        bala.splice(index, 1)
       }
}

//cria as particulas quando inimigo e destruido
function bagassar(inimigo,balas){
    for(let i = 0; i < inimigo.radius * 2; i++){
        const forssa = {
            x: (Math.random() - .5) * (Math.random() * 6),
            y: (Math.random() - .5) * (Math.random() * 6)
        }
        pedasso.push(new Pedassos(balas.x, balas.y, Math.random()*2, inimigo.color, forssa))
    }
}

//checa se os particulas já podem ser excluidas do array
function checaBagasso(){
    for(let i = pedasso.length - 1; i >= 0; i--){
        const p = pedasso[i]
        p.atualizar()
        
        if(p.alpha <= 0){
            pedasso.splice(i, 1)
        }
    }
}

//FUNÇÔES
