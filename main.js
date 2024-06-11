// Declaración de variables generales
const api_url="https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd%2Ceur";
const cont_apliacion=document.getElementById("precio-crypto")
const btn_eleccionmoneda=document.getElementById("btn--moneda");
let fechasGuardadas=[]; // Array para las fechas de los últimos días
let valoresBTC=[];
let btnCambioMoneda=document.getElementById("btn--monedagrafica");
let estadoCambioMoneda="e";
let dias=4; //Días que se van a guardar


// Animaciones 
var tl = gsap.timeline({});

tl.fromTo("#app", {scale:0,opacity: 0,}, {scale:1,opacity: 1,duration: 2,ease:"elastic"}).
  fromTo("#app--grafica", {left:-2000,opacity: 0}, {left:0,opacity: 1,duration: 2,ease:"elastic"});

// Animación pulsar en botón para cambiar valores de dólares a euros y viceversa 
btn_eleccionmoneda.addEventListener("click",function(){
  if(this.checked){
      tl.fromTo("#precio-crypto", {x:0}, {x:-600,duration: 1,onComplete:cambioMoneda,onCompleteParams: ["dolares"]}).fromTo("#precio-crypto", {x:600}, {x:0,duration: 1, ease: "power3.out"});
  }else{
      tl.fromTo("#precio-crypto", {x:0}, {x:-600,duration: 1,onComplete:cambioMoneda,onCompleteParams: ["euros"]}).fromTo("#precio-crypto", {x:600}, {x:0,duration: 1, ease: "power3.out"});
  }
})




//Poner la fecha del día en el widget
let fecha = new Date;
const fechaactual=document.getElementById("fechaactual");
fechaactual.innerHTML= fecha.getDate()+
    "/"+new Intl.DateTimeFormat('es-ES', { month: 'long'}).format(new Date())
        +"/"+fecha.getFullYear();



//Cuando se cargue el DOM ya se hacen las peticiones a la API
document.addEventListener("DOMContentLoaded",()=>{
  cambioMoneda("euros");
  guardarFechas();
})


// Función que conecta con la API y mira el valor de la moneda
function cambioMoneda(moneda){
    fetch(api_url)
    .then(res=>res.json())
        .then(data=>{

            if (moneda=="euros")
                cont_apliacion.innerHTML=(new Intl.NumberFormat("es-ES", {  style: 'currency',
                currency: 'EUR',
                currencySign: 'accounting',
                signDisplay: 'always'}).format(data.bitcoin.eur));
            else cont_apliacion.innerHTML=(new Intl.NumberFormat("es-ES", {
                style: 'currency',
                currency: 'USD',
                currencySign: 'accounting',
                signDisplay: 'always'}).format(data.bitcoin.usd));

            }).catch(function(error)  {
                console.log('Hubo un problema con la petición Fetch:' + error.message);
            });

}

// Guardar las fechas y valores de los últimos 10 días para la gráfica
function guardarFechas(){

    
    let fechaHoy=new Date();
    let fechaGuardar=new Date();
    let fechaFormateada;


    for (let i=1;i<=dias ;i++)
        {
            fechaHoy=new Date();
            fechaGuardar=new Date();
    
            fechaGuardar.setDate(fechaHoy.getDate()-i);

            let dia = fechaGuardar.getDate()
            let mes = fechaGuardar.getMonth()+1
            let anyo = fechaGuardar.getFullYear()
        
            fechaFormateada=`${dia}-${mes}-${anyo}`;

            fechasGuardadas[i-1]=fechaFormateada;
 
        
           //console.log(fechaFormateada)
        }

        
        urlApiFechas="https://api.coingecko.com/api/v3/coins/bitcoin/history?date=";
        let capaGrafica=document.getElementById("grafica--valores");
        

        const peticionValoresBTC=async (url) => {
          for (let i=0;i<dias ;i++){

            const response =await fetch(url+fechasGuardadas[i]);
            if (!response.ok)
              throw new Error ("WARN",response.status);
              
            const data = await response.json();
            let eurito=data.market_data.current_price.eur;
            let dolarito=data.market_data.current_price.usd;
            var temporal={eur:eurito,usd:dolarito}; 
            valoresBTC.push(temporal);
            //console.log(valoresBTC.length);       
            }
        }

        const resultOK = peticionValoresBTC(urlApiFechas).then(()=>{
          //console.log(valoresBTC);             
         }
        );
  

}



// Grafica

  const ctx=document.getElementById("migrafica").getContext("2d");
  const labels=fechasGuardadas;
  let valorEUR=[];
  let valorUSD=[];
  
  setTimeout(()=>{

valoresBTC.forEach((valor,indice)=>{
  //console.log (valoresBTC[indice].eur)
  valorEUR.push(valoresBTC[indice].eur);
  valorUSD.push(valoresBTC[indice].usd);
});
//console.log(valorEUR);

data ={
    labels,
    datasets:[
        {
        data:valorEUR, //Aquí van los valores de las gráficas
        label:"Precio del Bitcoin en Euros",
        fill:true,
        backgroundColor:'#afd9fd',
        
        },
        ],
    };
    
let  config = {
        type: 'bar',
        data: data,
        
        options: {
          responsive: true,  
          scales: {
            y: {
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value, index, ticks) {

                      if (estadoCambioMoneda=="e") 
                        return value + ' €';
                      else 
                        return value + ' $';

                    }
                }
            }},
          transitions: {
            show: {
              animations: {
                x: {
                  from: 0
                },
                y: {
                  from: 0
                }
              }
            },
            hide: {
              animations: {
                x: {
                  to: 0
                },
                y: {
                  to: 0
                }
              }
            }
          }
        }
      };



  let myChart= new Chart(ctx,config);

  // Animación pulsar en botón para cambiar valores monedas en gráfica
  btnCambioMoneda.addEventListener("click",function (){
    
    if(this.checked){ //Está en Euro y cambia a dólares
      myChart.data.datasets[0].label="Precio del Bitcoin en Dólares";
      myChart.data.datasets[0].data=valorUSD;
      estadoCambioMoneda="d";
    }else{ //Está en Dolar y cambia a euros
      myChart.data.datasets[0].label="Precio del Bitcoin en Euros";
      myChart.data.datasets[0].data=valorEUR;
      estadoCambioMoneda="e";
    }

    myChart.update();

  })

  

      
      
    


},1800);




