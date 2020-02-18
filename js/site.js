$.ajax({
    type: "GET",  
    url: "data/cohort-selection.json",
    dataType: "json",       
    success: function(response)  
    {
      processFile(response)
    }   
  });

//processing data

function processFile(data){
  console.log(data);
  currentCell = -1;
  currentLine = -1;
  cellType = '';
  nextCell()
  var converter = new showdown.Converter()


  function nextCell(){
    currentCell++;
    currentLine = -1;
    cellType = data.cells[currentCell].cell_type;
    if(cellType=='code'){
      $('#content').append('<div class="row"><div class="col-xs-1"><p>In [ ]</p></div><div id="parent'+currentCell+'" class="cell col-xs-11"><div id="content'+currentCell+'" class="code"></div></div></div>');
    } else {
      $('#content').append('<div class="row"><div class="col-xs-1"><p>In [ ]</p></div><div id="parent'+currentCell+'" class="markdowntype cell col-xs-11"><div id="content'+currentCell+'"></div></div></div>');
    }
    nextLine();
  }

  function nextLine(){
    window.scrollTo(0,document.body.scrollHeight);
    if(currentLine+1 < data.cells[currentCell].source.length){
      currentLine++;
      lineID = 'content'+currentCell+'line'+currentLine;
      content = data.cells[currentCell].source[currentLine];
      if(cellType=='code'){
        $('#content'+currentCell).append('<p id="'+lineID+'"></p>');
      } else {
        $('#content'+currentCell).append('<p id="'+lineID+'"></p>');
      }
      
      addNextChar('#'+lineID,content)
    } else {
      formatCell();
      addOutput(0);
    }
  }

  function addNextChar(id,content){
    currentContent = $(id).html().slice(0, -1);
    $(id).html(currentContent+content.charAt(0)+'|');
    if(content.length>0){
      if(cellType=='code'){
        wait = 5+Math.floor(Math.random()*75);
      } else {
        wait = 5+Math.floor(Math.random()*150);
      }
      setTimeout(function(){
        addNextChar(id,content.substring(1))
      },wait);
    } else {
      currentContent = $(id).html().slice(0, -1);
      $(id).html(currentContent);
      formatLine(id);
      nextLine();
    }
  }

  function formatLine(id){
    if(cellType=='markdown'){
      content = $(id).html();
      html = converter.makeHtml(content);
      $(id).html(html);
    }
    if(cellType=='code'){
      document.querySelectorAll('#parent'+currentCell).forEach((block) => {
        hljs.highlightBlock(block);
      });
    }
  }

  function formatCell(){
    if(cellType=='markdown'){
      let content = '';
      data.cells[currentCell].source.forEach(function(d){
        html = converter.makeHtml(d);
        content += '<p>'+html+'</p>';
      });
      $('#parent'+currentCell).html(content);
    }
  }

  function addOutput(count){
    if(cellType=='code'){
      if(count==0){
        $('#content').append('<div class="row"><div class="col-xs-1"><p>Out [ ]</p></div><div id="output'+currentCell+'" class="col-xs-11 output cell"></div></div>');
      }
      if(count<10){
         $('#output'+currentCell).append('.');
        setTimeout(function(){
          addOutput(count+1)
        },200)
      } else {
        outputs = data.cells[currentCell].outputs
        if(outputs.length>0){
          if(outputs[0].output_type=='stream'){
            let content = '';
            outputs[0].text.forEach(function(d){
              content += '<p class="stream">'+d+'</p>';
            });
            $('#output'+currentCell).html(content);
          } else {
            let content = '';
            outputs[0].data['text/html'].forEach(function(d){
              content += d;
            });
            $('#output'+currentCell).html(content);
          }
          
        }
        nextCell();        
      }
    } else {
      nextCell();
    }
    
  }
}