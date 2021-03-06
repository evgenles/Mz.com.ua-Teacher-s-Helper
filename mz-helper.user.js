// ==UserScript==
// @name         MZ autocreate lessons
// @namespace    http://tampermonkey.net/
// @version      0.17
// @description  Help to fill lesson on mz.com.ua
// @author       Evgenles
// @match        http://mz.com.ua/schedule/lesson/*
// @grant        none
// ==/UserScript==

Date.prototype.toISODateString = function() {
    return this.toISOString().replace(/T.*/,'');
};


Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

var filllessonsaditional = function(){
     $('#overlay_box').prepend('<div style="text-align:center"><label style="color:#ce1717;font-size: large;font-weight: bold;">Внимание!!! Перед нажатием "Заполнить"&nbsp обязательно проверьте правильность полей (Класс, Подгруппа, Предмет, Тип предмету, Урок, Кабинет)</label></div><div id="aditionalscriptdiv" style="display:table"><div style="display:table-row"><label style="display:table-cell">Дата начала</label><input id="datestartaditional" style="display:table-cell"/><label style="display:table-cell">(Формат: MM.DD.YYYY)</label></div><div  style="display:table-row"><label style="display:table-cell">Дата окончания</label><input id="dateendaditional" style="display:table-cell"/><label style="display:table-cell">(Формат: MM.DD.YYYY)</label></div><div style="display:table-row"><label style="display:table-cell">День недели</label><input id="dayofweekaditional" style="display:table-cell"/><label style="display:table-cell">(1 - Понедельник, 2 - вторник ...)</label></div><div><button id="statadditionquery">Заполнить</button></div></div>');       common.overlay.close();
            $('#statadditionquery').click(function(){
                var inputed = parseInt($('#dayofweekaditional').val());
                var startdate = new Date($('#datestartaditional').val()+' 12:00:00 GMT');
                var enddate = new Date($('#dateendaditional').val()+' 12:00:00 GMT');
                var currentdate = startdate;
                var ser = $('#editLessonForm').serialize();
                var regexdate = new RegExp('(lesson_date%5D=).*(&schedule%5Bbuzzer_id)');
                while(currentdate <= enddate){
                    if(currentdate.getDay()===inputed)
                    {
                        var toSend =  ser.replace(regexdate,'$1'+currentdate.toISODateString()+'$2');
                        $.ajax({
                            url: $('#editLessonForm')[0].action,
                            type: 'post',
                            data: toSend,
                            success: function(data) {
                                console.log("success ");
                            }
                        });
                    }
                    currentdate = currentdate.addDays(1);
                }
            });
};
(function() {
    'use strict';
    common.overlay({url:'/schedule/editor/homework?lesson='+document.querySelectorAll(".td_lesson")[0].id.replace("osr","").replace("topic","")+'&edit_mode=1'});
    var check = function(){
        if(document.getElementsByName("schedule[_csrf_token]")[0]!=undefined){
            $('#overlay_box').css("visibility","hidden");
            var csrftokenaditional = document.getElementsByName("schedule[_csrf_token]")[0].value;
            filllessonsaditional();
            setTimeout(function(){
                common.overlay.close();
                $('#overlay_box').css("visibility","visible");
             }, 1000 );
            var lessons = document.querySelectorAll(".td_lesson");
            for(var i = 0; i<lessons.length;i++){
                var newlesson = document.createElement('input');
                newlesson.value = lessons[i].children[0].innerText;
                newlesson.style.width = '100%';
                lessons[i].replaceChild(newlesson,lessons[i].children[0]);
            }
            var tableaditional =  document.querySelectorAll(".table_style")[3];
           tableaditional.insertAdjacentHTML('beforeend',"<tfoot><tr><td colspan='4' style='text-align:center'><button id='savelessonsaditional'>Save</button></td></tr></tfoot>");
            $("#savelessonsaditional").click(function(){
                let lastchildrowadd = tableaditional.lastElementChild.lastElementChild;
                if(lastchildrowadd.className=="SuccessAjaxRow")tableaditional.lastElementChild.removeChild(lastchildrowadd);
                console.log(csrftokenaditional);
                var lessonsrow = tableaditional.children[1].children;
                let hasfail = false;
                for (var i =0;i<lessonsrow.length;i++){
                    let scheduleidadd = lessonsrow[i].children[1].id.replace("osr","").replace("topic","");
                    let schedule = {
                        "schedule[lesson_topic]":lessonsrow[i].children[1].children[0].value,
                        "schedule[hometask]":lessonsrow[i].children[2].children[0].value,
                        "schedule[schedule_id]":scheduleidadd,
                        "schedule[_csrf_token]":csrftokenaditional
                    };
                     $.ajax({
                            url: "http://mz.com.ua/schedule/editor/homework?lesson="+scheduleidadd+"&edit_mode=1",
                            type: 'post',
                            data: jQuery.param(schedule),
                        });
                }
                tableaditional.lastElementChild.insertAdjacentHTML('beforeend', "<tr class='SuccessAjaxRow'><td colspan='4' style='text-align:center'><p style='color:green'> Выполнено!</p></td></tr>");
            });
        }
        else {
            setTimeout(check, 500);
        }
    };

check();
})();
