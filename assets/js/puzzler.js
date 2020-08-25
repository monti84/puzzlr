var $;
var jQuery;
var document;
var window;
var console;
var alert;
PZR = null;


(function ($, document, undefined) {
    'use strict';

    $.fn.randomize = function(childElem) {
      return this.each(function() {
          var $this = $(this);
          var elems = $this.children(childElem);

          elems.sort(function() { return (Math.round(Math.random())-0.5); });  

          $this.remove(childElem);  

          for(var i=0; i < elems.length; i++)
            $this.append(elems[i]);      

      });    
    }

    PZR = PZR || {};

    PZR = {
        config: {
            cols: 3,
            rows: 3,
            selectedImageIDX: 2
        },

        imageURLS: [
            'assets/images/lockdown-lion-cubs.webp',
            'assets/images/wp3358813-background-full-hd-1920x1080.jpg',
            'https://st.depositphotos.com/2121815/4314/i/950/depositphotos_43140099-stock-photo-can-of-mirinda-drink-isolated.jpg',
            'https://ak8.picdn.net/shutterstock/videos/17258128/thumb/3.jpg',
            'http://www.lemon64.com/museum/boxes/c64c_original_box.jpg'
        ],


        canvas: {
            container: document.getElementById('playground'),
            image: false
        },

        image: false,
        parts: [],
        dragging: {
            is_dragging: false,
            element: false,
            targetElement: false
        },


        init: function () {
        	var me = this;
            this.loadList();
        },

        loadList: function () {
            var previewItemMarkup = $('<li><img /></li>'),
                me = this,
                randomImageIDX = Math.floor(Math.random() * this.imageURLS.length) + 1
            ;
            
            previewItemMarkup.on('click', function () {
                $('#pregame').css("background-image", "url('" + $(this).attr('data-image_url') + "')");
                $('#pregame li').removeClass('selected');
                $(this).addClass('selected');
            });

            $('#pregame .start-button').on('click', function () {
                var url = $('#pregame .previews li.selected').attr('data-image_url');
                $('#pregame').fadeOut();
                me.startGame(url);
            })

            for (var i = 0; i < this.imageURLS.length; i++) {
                var currentURL = this.imageURLS[i],
                    previewItem = previewItemMarkup.clone(true)
                ;

                previewItem.attr('data-image_url', currentURL);
                previewItem.attr('data-index', i);
                previewItem.find('img').attr('src', currentURL);
                if (i == 0) {
                    previewItem.addClass('selected');
                    $('#pregame').css("background-image", "url('" + currentURL + "')");
                }

                previewItem.appendTo('#pregame .previews');
                
            }

            $('#pregame li:nth-child(' + randomImageIDX + ')').addClass('selected');
        },

        startGame: function (imageURL) {
            var me = this;
            this.image = new Image();
            this.image.onload = function() {
                var width = this.naturalWidth,
                    height = this.naturalHeight,
                    piece_width = width / me.config.cols,
                    piece_height = height / me.config.rows,
                    iPiece = 0
                ;

                for (var iRow = 0; iRow <= (me.config.rows - 1); iRow++) {
                    var row = [];
                    for (var iCol = 0; iCol <= (me.config.cols - 1); iCol++) {
                        $('<div draggable="true" class="piece" data-piece_id="' + iPiece + '" style="width:' + piece_width + 'px;height:' + piece_height + 'px;float: left;background: url(\'' + imageURL + '\') #000;background-position: -' + (iCol * piece_width) + 'px -' + (iRow * piece_height) + 'px;" />').appendTo($('#puzzlr'));
                        iPiece++;
                    }
                    
                    me.parts.push(row);
                }
    
                $('#puzzlr').removeClass('solved');
                $('#puzzlr').fadeIn();
                $('#puzzlr').randomize('.piece');
                $('#puzzlr .piece:nth-child(' + me.config.rows + 'n+1):not(:first-child)').css('clear', 'left');
                
                $('#puzzlr .piece[data-piece_id=0]').css('border-top-left-radius', '25px');
                $('#puzzlr .piece[data-piece_id=' + (me.config.rows - 1) + ']').css('border-top-right-radius', '25px');
                
                $('#puzzlr .piece[data-piece_id=' + ((me.config.cols * me.config.rows) - me.config.cols) + ']').css('border-bottom-left-radius', '25px');
                $('#puzzlr .piece[data-piece_id=' + ((me.config.cols * me.config.rows) - 1) + ']').css('border-bottom-right-radius', '25px');


                $('#puzzlr:not(.solved) .piece').on('dragstart', function (e) {              
                    if ($('#puzzlr').hasClass('solved')) return false;
                    console.log('drag start');
                    me.dragging.is_dragging = true;
                    me.dragging.element = $(e.currentTarget);
                    $(e.currentTarget).addClass('dragstart');
                });

                $('#puzzlr:not(.solved) .piece').on('dragenter', function (e) {
                    if ($('#puzzlr').hasClass('solved')) return false;
                    console.log('drag dragenter');
                    me.dragging.targetElement = $(e.target);
                    $(e.currentTarget).siblings().removeClass('dragover');
                    $(e.currentTarget).addClass('dragover');                
                    return true;
                });

                $('#puzzlr:not(.solved) .piece').on('dragend', function (e) {
                    if ($('#puzzlr').hasClass('solved')) return false;
                    console.log('drag dragend');
                    var from = $(e.target),
                        to = $(me.dragging.targetElement)
                    ;


                    $('#puzzlr .piece').removeClass('dragstart dragover');
                    if (from.attr('data-piece_id') != to.attr('data-piece_id')) {
                        from.clone(true).insertAfter(to);
                        to.clone(true).insertAfter(from);
                        
                        from.remove();
                        to.remove();
                    }


                    $('#puzzlr .piece').css('clear', 'none');
                    $('#puzzlr .piece:nth-child(' + me.config.rows + 'n+1):not(:first-child)').css('clear', 'left');



                    me.dragging.is_dragging = false;
                    me.isSolved();
                });
                
            }

            this.image.src = imageURL;
        },

        isSolved: function () {
            var have_not_eq = false;

            $('#puzzlr .piece').each(function () {
                if ($(this).attr('data-piece_id') != $(this).index()) {
                    have_not_eq = true;
                }

            })

            if (have_not_eq !== true) {
                $('#puzzlr').addClass('solved');
                $('#puzzlr').fadeOut();
                $('#puzzlr div').remove();
                $('#pregame').fadeIn();
            }
        }
   	}

    $(document).ready(function () {
        PZR.init();
    });
        
}(jQuery, document));