$(function () {
    $(window).load(function () {
        // Se ejecuta cuando la pagina está 100% cargada, incluído objetos
       // Creo una variable global para saber qué componente estoy configurando
        itemsDragger();
        eventsHandler();
    });
    var idComponentBuilderConfiguration = "";

    var quantities = {
        "c1": 0, // Text area
        "c2": 0, // Input
        "c3": 0, // Select
        "c4": 0, // Radio
        "c5": 0 // Checkbox
    };

    function itemsDragger() {
        $(".component").draggable({
            helper: "clone",
            revert: false, 
            cursor: "grab"
        });
        // Hacemos que #cart_items sea un contenedor droppable
        $(".components__builder").droppable({
            accept: ".component",
            drop: function (event, ui) {
                // Obtenemos el itemId del elemento arrastrado
                var componentID = ui.draggable.attr("id");
                addToBuildingHandler(componentID)
            }
        });
    }

    function addToBuildingHandler(itemId) {
        constructionWarmUp(itemId)
        if (quantities[itemId] >= 0) {
            quantities[itemId]++;
            inputBox = constructionWarmUp(itemId);

            // Creamos una copia del elemento
            var clonedComponent = $("#" + itemId).clone();
            // Modificamos el ID de la copia añadiendo una "k" delante
            var idComponentInBuildingZone = "k" + itemId;
            clonedComponent.attr("id", idComponentInBuildingZone); // Establecemos el valor del attr "id"
            addComponentToBuildingZone(clonedComponent, inputBox);
        }
    }

    function addComponentToBuildingZone(clonedComponent, inputBox) {
        var $container = $("<div class='buildingContainer'></div>");
        // Añadimos la clase "iBuilding" para identificar que es de la zona de construcción
        clonedComponent.addClass("iBuilding");

        var idComponentContainer = clonedComponent.attr("id");
        var idReal = idComponentContainer.substring(1);

        var idItemContainer = "k" + idReal + quantities[idReal];
        $container.attr("id", idItemContainer);
        // Creamos una caja de texto y el botón de eliminar
        var $deleteButton = $("<div class='deleteButton'><button>X</button></div>");
        // Añadimos los elementos al nuevo contenedor
        $container.append(clonedComponent, inputBox, $deleteButton);

        // Añadimos el nuevo contenedor al contenedor del constructor
        $("#builder").append($container);

        // Ocultamos el contenedor y lo mostramos con el fadeIn
        $container.hide().fadeIn(600);
    }

    function constructionWarmUp(itemID) {
        var inputBox = "";
        switch (itemID) {
            case "c1":
                inputBox = $("<div class='textAreaBox'><textarea placeholder='Área de texto'></textarea></div>");
                break;
            case "c2":
                inputBox = $("<div class='inputBox'><input type='text' placeholder='Texto'></div>");
                break;
            case "c3":
                inputBox = $("<div class='selectBox'><select><option value='opcion1'>Opción 1</option><option value='opcion2'>Opción 2</option></select></div>");
                break;
            case "c4":
                inputBox = $("<div class='radioBox'><input type='radio' name='radioGroup'> Botón de radio</div>");
                break;
            case "c5":
                inputBox = $("<div class='checkBox'><input type='checkbox'> Casilla de verificación</div>");
                break;
        }
        return inputBox;
    }

    function removeItemFromBuildingArea(objetoItem) {
        objetoItem.remove(); // Eliminamos el objeto del área de seleccionados
        var iddeldivAEliminar = "#" + objetoItem.attr("id") + "b";
        $(iddeldivAEliminar).remove();
    }

    function eventsHandler() {
        // Nota: El método off se utiliza para eliminar los manejadores de eventos previamente adjuntos. 
        // Al agregar el método off antes del on, estás asegurándote de que cualquier manejador de eventos anteriormente asociado al mismo evento y selector se elimine antes de adjuntar el nuevo manejador de eventos.
        // Configuración manejador de eventos de añadir la configuración del elemento
        $("#builder").off("click", ".buildingContainer").on("click", ".buildingContainer", function (event) {
            event.preventDefault();
            var itemId = "#" + $(this).closest('.buildingContainer').attr('id');
            componentFieldsEditor(itemId);
            valuesIn = obtainValuesAddedByUser(itemId);
            formGenerated = outputGenerator(itemId, valuesIn);
            var formGeneratedDiv = $(this).find('.formGenerated');
            // var formCode = `<form action="#" method="post">`;
            // Verificar si el elemento ya existe
            if (formGeneratedDiv.length === 0) {
                // Si no existe, añadirlo dentro del elemento actual
                $(this).append(`<div class="formGenerated"></div>`);
                formGeneratedDiv = $(this).find('.formGenerated');
            } else {
                // Si ya existe, realizar alguna acción adicional o simplemente no hacer nada
                $(formGeneratedDiv).html(" ");
                $(formGeneratedDiv).html(formGenerated);
            }
        });
        // Agregamos un controlador de eventos al formulario para evitar su envío predeterminado
        $('formBuilder').submit(function (event) {
            event.preventDefault(); // Detener la acción predeterminada del envío del formulario
            // Puedes agregar más lógica aquí si es necesario
        });
        // Configuración manejador de eventos botones ".deleteButton"
        $("#builder").off("click", ".deleteButton").on("click", ".deleteButton", function (event) {
            event.stopPropagation(); // con esto nos limitamos a que solo se ejecute el eliminar, y no el siguiente
            event.preventDefault();
            // Obtenemos el ID del elemento padre
            var itemId = "#" + $(this).closest('.buildingContainer').attr('id');
            var objetoItem = $(itemId); // Lo transformamos en un objeto
            removeItemFromBuildingArea(objetoItem);
        });

        // Add an event listener to the "generateHTML" button
        $("#generateHTML").on("click", function(event) {
            event.preventDefault();
            // Generate the HTML content and display the popup
            generateHTML();
        });
        $("#backToGenerator").on("click", function(event) {
            event.preventDefault();
            // Generate the HTML content and display the popup
            var objectOutput = $("#htmloutput");
            $(objectOutput).css('display', 'none');
            var objectGenerator = $(".builder");
            $(objectGenerator).css('display', 'block');
        });
    }

    function obtainValuesAddedByUser(itemId) {
        // Recogemos los datos del formulario como una cadena de consulta
        var formData = $('#formBuilder' + itemId.substring(1)).serialize();
        console.log(formData);
        var dataObtained = {};
        // Dividimos la cadena de consulta en pares clave-valor
        var pairs = formData.split('&');
        // Iteramos sobre cada par clave-valor
        $.each(pairs, function(index, pair) {
            var keyValue = pair.split('=');
            var key = decodeURIComponent(keyValue[0]);
            var value = decodeURIComponent(keyValue[1] || '');
            dataObtained[key] = value;  // Asignamos los valores
        });
        return dataObtained;
    }
    

    function componentFieldsEditor(itemId){
        $(itemId).css("background", "gray");
        $("#" + idComponentBuilderConfiguration).hide();
        if (elementConfiguratorHandler((itemId + "b")) == false){ 
            var choice = itemId.substring(2, 4); // Cogemos solo el c1, c2 etc
            idComponentConfiguratorActual = itemId.substring(1) + "b"; // le quitamos el #
            var formHTML = "<div id ='" + idComponentConfiguratorActual + "'>";
            formHTML += componentSettingsSetter(formHTML, choice, itemId);
            $("#components__settings__builder").append(formHTML);
            $("#" + idComponentConfiguratorActual).show();
        } else {
            idComponentConfiguratorActual = itemId.substring(1) + "b"; // le quitamos el #
            $("#" + idComponentConfiguratorActual).show();
        }
        idLastComponentBuild = idComponentBuilderConfiguration.substring(0, 4); // Cojo el valor del último elemento para cambiarle el color
        $("#" + idLastComponentBuild).css("background", "white");
        idComponentBuilderConfiguration = idComponentConfiguratorActual;
    }

    function elementConfiguratorHandler(itemId){
        var componentAlreadyIncluded = false;
        // Recorremos todos los divs de la clase 'components__settings__builder'
        $(".components__settings__builder div").each(function() {
            var divId = "#" + $(this).attr("id");  // Obtenemos el ID del div actual
            if (itemId === (divId)) componentAlreadyIncluded = true; // Verificamos si el ID del div actual coincide con el ID que estamos buscando
        });
        return componentAlreadyIncluded;
    }

    function componentSettingsSetter(formHTML, choice, itemId) {
        var item = itemId.substring(1);
        switch (choice) {
            case "c1":
                formHTML = `
                    <form class="formBuilder" id="formBuilder${item}">
                        <fieldset>
                            <label for="name">Name:</label>
                            <input type="text" id="name" name="name">

                            <label for="textarea1Label">Label:</label>
                            <input type="text" id="textarea1Label" name="textarea1Label">

                            <label for="placeholder">Placeholder:</label>
                            <input type="text" id="placeholder" name="placeholder">

                            <label for="helper">Helper:</label>
                            <input type="text" id="helper" name="helper">

                            <label for="class">Class:</label>
                            <input type="text" id="class" name="class">

                            <label for="width">Width:</label>
                            <input type="text" id="width" name="width">

                            <label for="disabled">Disabled:</label>
                            <input type="checkbox" id="disabled" name="disabled">

                            <label for="required">Required:</label>
                            <input type="checkbox" id="required" name="required">
                        </fieldset>
                    </form>
                `;
                break;
            case "c2":
                formHTML = `
                <form class="formBuilder" id="formBuilder${item}">
                    <fieldset>
                        <label for="type">Type:</label>
                        <input type="text" id="type" name="type">

                        <label for="name">Name:</label>
                        <input type="text" id="name" name="name">

                        <label for="defaultValue">Default value:</label>
                        <input type="text" id="defaultValue" name="defaultValue">

                        <label for="label">Label:</label>
                        <input type="text" id="label" name="label">

                        <label for="placeholder">Placeholder:</label>
                        <input type="text" id="placeholder" name="placeholder">

                        <label for="helper">Helper:</label>
                        <input type="text" id="helper" name="helper">

                        <label for="class">Class:</label>
                        <input type="text" id="class" name="class">

                        <label for="width">Width:</label>
                        <input type="text" id="width" name="width">

                        <label for="disabled">Disabled:</label>
                        <input type="checkbox" id="disabled" name="disabled">

                        <label for="readonly">Readonly:</label>
                        <input type="checkbox" id="readonly" name="readonly">

                        <label for="required">Required:</label>
                        <input type="checkbox" id="required" name="required">
                    </fieldset>
                </form>
                `;
                break;
            case "c3":
                formHTML = `
                    <form class="formBuilder" id="formBuilder${item}">
                        <fieldset>
                            <label for="selectName">Name:</label>
                            <input type="text" id="selectName" name="selectName">

                            <label for="label">Label:</label>
                            <input type="text" id="label" name="label">

                            <label for="placeholder">Placeholder:</label>
                            <input type="text" id="placeholder" name="placeholder">

                            <label for="helper">Helper:</label>
                            <input type="text" id="helper" name="helper">

                            <label for="class">Class:</label>
                            <input type="text" id="class" name="class">

                            <label for="width">Width:</label>
                            <input type="text" id="width" name="width">

                            <label for="disabled">Disabled:</label>
                            <input type="checkbox" id="disabled" name="disabled">

                            <label for="required">Required:</label>
                            <input type="checkbox" id="required" name="required">

                            <label for="multiple">Multiple:</label>
                            <input type="checkbox" id="multiple" name="multiple">

                            <!-- Opciones del select -->
                            <div id="selectOptions">
                                <div>
                                    <label for="option1">Option 1:</label>
                                    <input type="text" id="option1" name="option1">
                                </div>

                                <div>
                                    <label for="option2">Option 2:</label>
                                    <input type="text" id="option2" name="option2">
                                </div>

                                <div>
                                    <label for="option3">Option 3:</label>
                                    <input type="text" id="option3" name="option3">
                                </div>

                                <div>
                                    <label for="option4">Option 4:</label>
                                    <input type="text" id="option4" name="option4">
                                </div>
                            </div>
                        </fieldset>
                    </form>
                `;

            break;            
            case "c4":
                formHTML = `
                    <form class="formBuilder" id="formBuilder${item}">
                        <fieldset>
                            <label for="inline">Inline:</label>
                            <select id="inline" name="inline">
                                <option value="yes">Sí</option>
                                <option value="no">No</option>
                            </select>

                            <label for="center">Center:</label>
                            <select id="center" name="center">
                                <option value="yes">Sí</option>
                                <option value="no">No</option>
                            </select>


                            <label for="radioGroupLabel">Radiogroup label:</label>
                            <input type="text" id="radioGroupLabel" name="radioGroupLabel">

                            <label for="helper">Helper:</label>
                            <input type="text" id="helper" name="helper">

                            <label for="radioGroupClass">Radiogroup Class:</label>
                            <input type="text" id="radioGroupClass" name="radioGroupClass">

                            <label for="width">Width:</label>
                            <input type="text" id="width" name="width">

                            <label for="required">Required:</label>
                            <input type="checkbox" id="required" name="required">

                            <!-- Opciones del button form -->
                            <div id="selectOptions">
                                <div>
                                    <label for="option1">Option 1:</label>
                                    <input type="text" id="option1" name="option1">
                                </div>

                                <div>
                                    <label for="option2">Option 2:</label>
                                    <input type="text" id="option2" name="option2">
                                </div>

                                <div>
                                    <label for="option3">Option 3:</label>
                                    <input type="text" id="option3" name="option3">
                                </div>

                                <div>
                                    <label for="option4">Option 4:</label>
                                    <input type="text" id="option4" name="option4">
                                </div>
                            </div>
                        </fieldset>
                    </form>
                `;
                break;
            case "c5":
                formHTML = `
                    <form class="formBuilder" id="formBuilder${item}">
                        <fieldset>
                            <label for="inline">Inline:</label>
                            <select id="inline" name="inline">
                                <option value="yes">Sí</option>
                                <option value="no">No</option>
                            </select>
            
                            <label for="center">Center:</label>
                            <select id="center" name="center">
                                <option value="yes">Sí</option>
                                <option value="no">No</option>
                            </select>
            
                            <label for="checkboxGroupName">Checkboxgroup name:</label>
                            <input type="text" id="checkboxGroupName" name="checkboxGroupName">
                            
                            <label for="checkboxGroupLabel">Checkboxgroup label:</label>
                            <input type="text" id="checkboxGroupLabel" name="checkboxGroupLabel">
            
                            <label for="helper">Helper:</label>
                            <input type="text" id="helper" name="helper">
            
                            <label for="checkboxGroupClass">Checkboxgroup Class:</label>
                            <input type="text" id="checkboxGroupClass" name="checkboxGroupClass">
            
                            <label for="width">Width:</label>
                            <input type="text" id="width" name="width">
            
                            <label for="required">Required:</label>
                            <input type="checkbox" id="required" name="required">

                            <!-- Opciones del checkbox -->
                            <div id="selectOptions">
                                <div>
                                    <label for="option1">Option 1:</label>
                                    <input type="text" id="option1" name="option1">
                                </div>

                                <div>
                                    <label for="option2">Option 2:</label>
                                    <input type="text" id="option2" name="option2">
                                </div>

                                <div>
                                    <label for="option3">Option 3:</label>
                                    <input type="text" id="option3" name="option3">
                                </div>

                                <div>
                                    <label for="option4">Option 4:</label>
                                    <input type="text" id="option4" name="option4">
                                </div>
                            </div>
                        </fieldset>
                    </form>
                `;
            break;
        }
        formHTML += "</div>";
        return formHTML;
    }

    function outputGenerator(item, attributes) {
        var choice = item.substring(2, 4); // Cogemos solo el c1, c2 etc
        var formCode = "";
        switch (choice) {
            case "c1":
                formCode += `<textarea id="miTextarea" 
                name="${attributes.name}" 
                label="${attributes.textarea1Label}" 
                placeholder="${attributes.placeholder}" 
                helper="${attributes.helper}"
                class="${attributes.class}"
                width="${attributes.width}"
                ${attributes.disabled === 'on' ? 'disabled' : ''}
                ${attributes.required === 'on' ? 'required' : ''}
                ></textarea>`;
                break;   
            case "c2":
                formCode += ` <input type="${attributes.type}"
                id="miInput"
                name="${attributes.name}"
                value="${attributes.defaultValue}"
                aria-label="${attributes.label}"
                placeholder="${attributes.placeholder}"
                helper="${attributes.helper}"
                class="${attributes.class}"
                width="${attributes.width}"
                ${attributes.disabled === 'on' ? 'disabled' : ''}
                ${attributes.readonly === 'on' ? 'disabled' : ''}
                ${attributes.required === 'on' ? 'required' : ''}
                >`;
                break; 
            case "c3":
                formCode += `
                    <select id="miSelect" 
                    name="${attributes.name}" 
                    label="${attributes.label}"
                    helper="${attributes.helper}"
                    class="${attributes.class}"
                    width="${attributes.width}"
                    ${attributes.required === 'on' ? 'required' : ''}>
                    <option value="" disabled selected>${attributes.placeholder || 'Selecciona una opción'}</option>
                    ${attributes.option1 ? `<option value="${attributes.option1}" ${attributes.option1 === attributes.selectedOption ? 'selected' : ''}>${attributes.option1}</option>` : ''}
                    ${attributes.option2 ? `<option value="${attributes.option2}" ${attributes.option2 === attributes.selectedOption ? 'selected' : ''}>${attributes.option2}</option>` : ''}
                    ${attributes.option3 ? `<option value="${attributes.option3}" ${attributes.option3 === attributes.selectedOption ? 'selected' : ''}>${attributes.option3}</option>` : ''}
                    ${attributes.option4 ? `<option value="${attributes.option4}" ${attributes.option4 === attributes.selectedOption ? 'selected' : ''}>${attributes.option4}</option>` : ''}
                </select>`;
                break;
            case "c4":
                formCode += `
                    <div style="${attributes.inline === 'yes' ? 'display: inline-block;' : ''} ${attributes.center === 'yes' ? 'text-align: center;' : ''}" id="${attributes.radioGroupName}" class="${attributes.radioGroupClass}" helper="${attributes.helper}">
                        <label>${attributes.radioGroupLabel}</label>
                        ${attributes.required === 'on' ? '<span class="required">*</span>' : ''}
                        <br>
                        ${attributes.option1 ? `
                            <input type="radio" id="${attributes.name}_option1" name="${attributes.radioGroupName}" value="${attributes.option1}" ${attributes.option1 === attributes.selectedOption ? 'checked' : ''}>
                            <label for="${attributes.name}_option1">${attributes.option1}</label><br>` : ''}
                        ${attributes.option2 ? `
                            <input type="radio" id="${attributes.name}_option2" name="${attributes.radioGroupName}" value="${attributes.option2}" ${attributes.option2 === attributes.selectedOption ? 'checked' : ''}>
                            <label for="${attributes.name}_option2">${attributes.option2}</label><br>` : ''}
                        ${attributes.option3 ? `
                            <input type="radio" id="${attributes.name}_option3" name="${attributes.radioGroupName}" value="${attributes.option3}" ${attributes.option3 === attributes.selectedOption ? 'checked' : ''}>
                            <label for="${attributes.name}_option3">${attributes.option3}</label><br>` : ''}
                        ${attributes.option4 ? `
                            <input type="radio" id="${attributes.name}_option4" name="${attributes.radioGroupName}" value="${attributes.option4}" ${attributes.option4 === attributes.selectedOption ? 'checked' : ''}>
                            <label for="${attributes.name}_option4">${attributes.option4}</label><br>` : ''}
                        ${attributes.helper ? `<small>${attributes.helper}</small><br>` : ''}
                        ${attributes.required === 'on' ? '<small>Este campo es obligatorio</small>' : ''}
                    </div>`;
                break;
            case "c5":
                formCode += `
                    <div id="${attributes.checkboxGroupName}" class="${attributes.checkboxGroupClass}" helper="${attributes.helper}">
                        <label>${attributes.checkboxGroupLabel}</label>
                        ${attributes.required === 'on' ? '<span class="required">*</span>' : ''}
                        <br>
                        ${attributes.option1 ? `
                            <input type="checkbox" id="${attributes.name}_option1" name="${attributes.option1}" value="${attributes.option1}" ${attributes.option1 === attributes.selectedOption ? 'checked' : ''}>
                            <label for="${attributes.name}_option1">${attributes.option1}</label><br>` : ''}
                        ${attributes.option2 ? `
                            <input type="checkbox" id="${attributes.name}_option2" name="${attributes.option2}" value="${attributes.option2}" ${attributes.option2 === attributes.selectedOption ? 'checked' : ''}>
                            <label for="${attributes.name}_option2">${attributes.option2}</label><br>` : ''}
                        ${attributes.option3 ? `
                            <input type="checkbox" id="${attributes.name}_option3" name="${attributes.option3}" value="${attributes.option3}" ${attributes.option3 === attributes.selectedOption ? 'checked' : ''}>
                            <label for="${attributes.name}_option3">${attributes.option3}</label><br>` : ''}
                        ${attributes.option4 ? `
                            <input type="checkbox" id="${attributes.name}_option4" name="${attributes.option4}" value="${attributes.option4}" ${attributes.option4 === attributes.selectedOption ? 'checked' : ''}>
                            <label for="${attributes.name}_option4">${attributes.option4}</label><br>` : ''}
                        ${attributes.helper ? `<small>${attributes.helper}</small><br>` : ''}
                        ${attributes.required === 'on' ? '<small>Este campo es obligatorio</small>' : ''}
                    </div>`;
                break;
        }

        formCode = formCode.replace(/</g, "&lt;");
        formCode = formCode.replace(/>/g, "&gt;");
        
        return formCode;
    }
    function generateHTML(){
        var formattedHTML = '<pre><code>';
        var formInit = `<form action="#" method="post">
        `;
        formInit = formInit.replace(/</g, "&lt;");
        formInit = formInit.replace(/>/g, "&gt;");
        formattedHTML += formInit;

        var cantidadBuildingContainers = $(".components__builder .buildingContainer").length;
        for (var i = 0; i < cantidadBuildingContainers; i++) {
            var buildingContainer = $(".components__builder .buildingContainer").eq(i);
          
            // Acceder al div con la clase .formGenerated dentro de cada .buildingContainer
            var formGeneratedDiv = buildingContainer.find(".formGenerated");
                var divcontent = $(formGeneratedDiv).html();
                console.log(divcontent);
                // Tenemos que adaptar el código a un formato especial "escarpar"
                // para que lo pueda mostrar el html
                divcontent = divcontent.replace(/</g, "&lt;");
                divcontent = divcontent.replace(/>/g, "&gt;");
                formattedHTML += divcontent;
                console.log("código del formulario de " +i+ " añadido");
                console.log("No se encontró el div .formGenerated dentro de este .buildingContainer");
          }
          



        $("#overlay").fadeIn();
            var formEnd = `
        <input type="submit" value="Enviar">
</form>
            `;
            formEnd = formEnd.replace(/</g, "&lt;");
            formEnd = formEnd.replace(/>/g, "&gt;");
            formattedHTML += formEnd;
            formattedHTML += `</code></pre>`;
            var objectOutput = $("#htmloutput");
            $(objectOutput).css('display', 'flex');
            var objectGenerator = $(".builder");
            $(objectGenerator).css('display', 'none');
            $("#htmloutput__shown").html(formattedHTML);
            console.log(formattedHTML);
    }
});