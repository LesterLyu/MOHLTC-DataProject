
var $TABLE = $('#table');
var $BTN = $('#export-btn');
var $EXPORT = $('#export');
var $ACTUALTABLE = $('.table');
var categoryCounter = 2;
//adds row




$('.table-delete-column').click(function(){
  var counter =0;
 $ACTUALTABLE.find('tr').each(function(){
   var trow = $(this);
   //deletes from all table rows that do not have the 'hidden' class
  var rowLength = document.getElementById('myTable').rows[0].cells.length;

   if(!trow.hasClass("hide") && (rowLength > 1 && counter == 0 ))
   {
     if(!trow.find('td').eq(rowLength-1).hasClass('no-delete'))
     {
       trow.find('td').eq(rowLength-1).remove();
       categoryCounter --;
     }
   }
   if(counter > 0  && !trow.hasClass("hide"))
   {

     if(!trow.find('td').eq(rowLength).hasClass('no-delete'))
     {
       trow.find('td').eq(rowLength).remove();
     }
   }
     counter ++;
  })

  })
  //export the table to excel!
  function fnExcelReport()
  {
      var tab_text="<table border='2px'><tr bgcolor='#87AFC6'>";
      var textRange; var j=0;
      tab = document.getElementById('myTable'); // id of table
      var ths = tab.rows[j].getElementsByTagName('td');
      console.log(ths[0]);
      tab_text = tab_text + "<td> <b> Attribute </b> </td>"  ;
      for(j = 0 ; j < tab.rows.length ; j++)
      {

          if(j != 1)
          {//array of all the input tags --- an unpleasant hack, I know
          var predefined = tab.rows[j].getElementsByTagName('select');
          var inputs = tab.rows[j].getElementsByTagName('input');
          for(var i = 0; i < predefined.length; i++)
          {
            //adding to the tab_text while inserting the <td> tags with the array of all the input tags
            tab_text = tab_text + "<td>" + predefined[i].value + "</td>" ;
            for(var x = 0; x < inputs.length; x++)
            {

              tab_text = tab_text + "<td>" + inputs[x].value + "</td>" ;
            }
          }
          tab_text=tab_text+"</tr>";
          }
      }
      //replacing the unwanted columns in the excel chart. kind of a hack where I just go into the tab_text string and remove the columns that contain the glyphicons so the excel sheet doesn't contain it
      tab_text = tab_text.replace(/<td class="no-delete"><span class="table-remove glyphicon glyphicon-remove" style="margin-left: 5%;"><\/span><\/td>/g,'');
      tab_text = tab_text.replace(/<td class="no-delete"><span class="table-up glyphicon glyphicon-arrow-up" style="margin-left: 5%;"><\/span><span class="table-down glyphicon glyphicon-arrow-down" style="margin-left: 5%;"><\/span><\/td>/g, '');
      //tab_text=tab_text+"</tr>";
      tab_text=tab_text+"</table>";
        console.log(tab_text);
      tab_text= tab_text.replace(/<A[^>]*>|<\/A>/g, "");//remove if u want links in your table
      tab_text= tab_text.replace(/<img[^>]*>/gi,""); // remove if u want images in your table


      var ua = window.navigator.userAgent;
      var msie = ua.indexOf("MSIE ");

      if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./))      // If Internet Explorer
      {
          txtArea1.document.open("txt/html","replace");
          txtArea1.document.write(tab_text);
          txtArea1.document.close();
          txtArea1.focus();
          sa=txtArea1.document.execCommand("SaveAs",true,"Say Thanks to Sumit.xls");
      }
      else                 //other browser not tested on IE 11
          sa = window.open('data:application/vnd.ms-excel,' + encodeURIComponent(tab_text));

      return (sa);
  }


$('.table-remove').click(function () {
  $(this).parents('tr').detach();

});



$('.table-up').click(function () {
  var $row = $(this).parents('tr');
  if ($row.index() === 1) return; // Don't go above the header
  $row.prev().before($row.get(0));
});

$('.table-down').click(function () {
  var $row = $(this).parents('tr');
  $row.next().after($row.get(0));
});

// A few jQuery helpers for exporting only
jQuery.fn.pop = [].pop;
jQuery.fn.shift = [].shift;

$BTN.click(function () {
  var $rows = $TABLE.find('tr:not(:hidden)');
  var headers = [];
  var data = [];

  // Get the headers (add special header logic here)
  $($rows.shift()).find('th:not(:empty)').each(function () {
    headers.push($(this).text().toLowerCase());
  });

  // Turn all existing rows into a loopable array
  $rows.each(function () {
    var $td = $(this).find('td');
    var h = {};

    // Use the headers from earlier to name our hash keys
    headers.forEach(function (header, i) {
      h[header] = $td.eq(i).text();
    });

    data.push(h);
  });

  // Output the result
  $EXPORT.text(JSON.stringify(data));
});
