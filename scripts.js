"use strict";

//Base de datos indexada, almacena info en el navegador
//Base de datos no relacional, key, value.
//Orientado a objetos y asincrono (realtime)
//Trabaja con eventos del dom
//CRUD CREATE,READ,UPDATE,DELETE

//Solicitud para abrir una base de datos, si no existe la crea
//El segundo parametro es el versionado
const IDBRequest = indexedDB.open("database",1);

//si no esta creada.
IDBRequest.addEventListener("upgradeneeded",()=>{
    //El resultado de la solicitud, y si todo es correcto la db se guarda.
    const db = IDBRequest.result;
    //A medida que se hacen registros, se aumenta el key para indentificarlo.
    db.createObjectStore("nombres",{
        autoIncrement: true
    });
})

//si todo salio bien
IDBRequest.addEventListener("success",()=>{
    console.log("Todo salio bien");
    leerObjetos();
});

//si saltaron errores
IDBRequest.addEventListener("error",()=>{
    console.log("Ocurrio un error");
});

document.getElementById('add').addEventListener("click",()=>{
    let nombre = document.getElementById("nombre").value;
    if(nombre.length > 0){
        if(document.querySelector(".posible") != undefined){
            if(confirm("Hay elementos sin guardar: Queres continuar?")){
                addObjeto({nombre});
                leerObjetos();
            }
        }else{
            addObjeto({nombre});
            leerObjetos();
        }
    }
})


const addObjeto = objeto =>{
    const IDBData = getIDBData("readwrite");
    IDBData[0].add(objeto);
    
    IDBData[1].addEventListener("complete",()=>{
        console.log("Objeto agregado correctamente");
    })
}

const leerObjetos = ()=>{

    const IDBData = getIDBData("readonly");

    //El cursor nos lee los datos.
    const cursor = IDBData[0].openCursor();
    const fragment = document.createDocumentFragment();
    document.querySelector(".nombres").innerHTML = "";
    cursor.addEventListener("success",()=>{
        if(cursor.result){
            let elemento = nombresHTML(cursor.result.key,cursor.result.value);
            fragment.appendChild(elemento);
            cursor.result.continue();
        }else{
           document.querySelector(".nombres").appendChild(fragment);
        } 
    })
}

const modificarObjeto = (key,objeto) =>{
    const IDBData = getIDBData("readwrite");

    //Si el objeto no existe lo agrega, si existe lo modifica
    IDBData[0].put(objeto,key);

    IDBData[1].addEventListener("complete",()=>{
        console.log("Objeto modificado correctamente");
    })
}

const eliminarObjeto = (key) =>{
    const IDBData = getIDBData("readwrite");
    IDBData[0].delete(key);
    
    IDBData[1].addEventListener("complete",()=>{
        console.log("Objeto eliminado correctamente");
    })
}

const getIDBData = (mode)=>{
    const db = IDBRequest.result;
    const IDBtransaction = db.transaction("nombres",mode);
    const objectStore = IDBtransaction.objectStore("nombres"); 
    return [objectStore,IDBtransaction];
}


const nombresHTML = (id,name)=>{
    const container = document.createElement("div");
    const h2 = document.createElement("h2");
    const options = document.createElement("div");
    const saveButton= document.createElement("button");
    const deleteButton = document.createElement("button");

    container.classList.add("nombre");
    options.classList.add("options");
    saveButton.classList.add("imposible");
    deleteButton.classList.add("delete");

    saveButton.textContent = "Guardar";
    deleteButton.textContent = "Eliminar";
    h2.textContent = name.nombre;

    h2.setAttribute("contenteditable","true");
    h2.setAttribute("spellcheck","false");

    options.appendChild(saveButton);
    options.appendChild(deleteButton);
    container.appendChild(h2);
    container.appendChild(options);

    h2.addEventListener("keyup",()=>{
        saveButton.classList.replace("imposible","posible");
    })

    saveButton.addEventListener("click",()=>{
        if(saveButton.className == "posible"){
            modificarObjeto(id,{nombre: h2.textContent});
            saveButton.classList.replace("imposible","posible");
        }
    })

    deleteButton.addEventListener("click",()=>{
        eliminarObjeto(id);
        document.querySelector(".nombres").removeChild(container);
        
    });

    return container;
}


