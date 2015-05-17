define('lib/ST', function(require, exports, module) {
    (function(){
         window.ST = {
             //常用方法
             Lang:{
                 getType:function(obj){
                     var type;
                     return (type=typeof(obj))=='object'?obj==null&&'null'||Object.prototype.toString.call(obj).slice(8,-1).toLowerCase():type;
                 },
                 isString:function(obj){
                     return this.getType(obj)=='string';
                 },
                 isMethod:function(obj){
                     return this.getType(obj)=='function';
                 },
                 isArray:function(obj){
                     return this.getType(obj)=='array';
                 },
                 isUndefined:function(obj){
                     return this.getType(obj)=='undefined';
                 },
                 isNumber:function(obj){
                     return this.getType(obj)=='number';
                 },
                 isObject:function(obj){
                     return this.getType(obj)=='object';
                 },
                 is:function(test,aim){
                     var result;
                     try{
                         result=(aim=='string'||ST.Lang.isString(aim))?ST.Lang.getType(test)==aim:test instanceof aim
                     } catch(e) {};
                     return !! result;
                 },
                 toArray:function(args,split){
                     if(!arguments.length)return[];
                     if(!args||this.isString(args)||this.isUndefined(args.length)){
                         return(args+'').split(split?split:'');
                     }
                     var result=[];
                     for(var i=0,j=args.length;i<j;i++){
                         result[i]=args[i];
                     }
                     return result;
                 }
             },
             JTE:(function(){
                 var w, y,_y, p = function(f, k, j) {
                         for (j = 0; k--;) if (f.charAt(k) == '\\') j++;
                         else break;
                         return j % 2
                     },cache={},
                     q = function(f) {
                         return f.replace(/\\/g,'\\\\').replace(/\"/g,'\\"');
                     },
                     v = function(a, b) {
                         a = a.substr(0, b).replace(/\\{2}/g,'').replace(/\\[\w\W]/g,'');
                         return (a.match(/\[/g) || []).length == (a.match(/]/g) || []).length
                     },
                     n = function(f, k, j) {
                         for (var m = -1,
                                  s = f.length,
                                  i = [], g, h, l; m++<s - 1;) {
                             h = f.charAt(m);
                             if (h == '/' && !g && !p(f, m) && v(f, m)) l = !l;
                             else if ((h == '\'' || h == '"') && !l && !g) g = h;
                             else if (h == g && !l && !p(f, m)) g = null;
                             g || i.push(h)
                         }
                         if (j) return g;
                         i = i.join('');
                         if (k) return i;
                         return (i.match(/{/g) || []).length == (i.match(/}/g) || []).length
                     },
                     z = function(a, s) {
                         var c,
                             e = [],
                             d,
                             o,
                             r = function(f) {
                                 //o=c;
                                 for (;;) if (n(d)) {
                                     e.push(f ? 'Pft$.push(' + d + ');': d.replace(/^call\b/,'') + (d.contains(/;$/) ? '': ';'));
                                     break
                                 } else {
                                     c = a.indexOf('}', c + 1);
                                     if (c == -1) throw new Error('error near:'+d);
                                     d = a.slice(1, c)
                                 }
                             };
                         for (e.push('var Pft$=[];with(' + s.key + '){');;) {
                             c = a.indexOf('{');
                             if (c != -1) {
                                 d = a.slice(0, c).replace(/\+{/,'');
                                 d.length && e.push('Pft$.push("' + q(d) + '");');
                                 if (c > 0) o = a.charAt(c - 1);
                                 if (o == '\\' && p(a, c)) {
                                     e.push('Pft$.push("{");');
                                     a = a.substr(c + 1);
                                     continue
                                 }
                                 a = a.substr(c);
                                 c = a.indexOf('}');
                                 if (c == -1) break;
                                 else {
                                     for (d = a.slice(1, c).trim();;) if (n(d, 0, 1)) {
                                         c = a.indexOf('}', c + 1);
                                         if (c == -1) break;
                                         d = a.slice(1, c).trim()
                                     } else break;
                                     if (d) if (d.contains(/^(?:for|if|while|try)\b/)) e.push(d + '{');
                                     else if (d.contains(/^\/(?:for|if|while|try)\b/)) e.push('}');
                                     else if (d.contains(/^(?:else|catch|finally)\b/)) e.push('}' + d + '{');
                                     else d.contains(/^(?:continue|break|return|throw|var|call)\b/) || n(d, 1).contains(/[^=!><]=[^=]/) ? r() : r(1);
                                     a = a.substr(c + 1)
                                 }
                             } else break;

                         }
                         a && e.push('Pft$.push("' + q(a) + '");');
                         e.push('}return Pft$.join("")');
                         return Function(s.key, e.join(''));
                     },
                     x = function(a, b, e, r) {
                         e = ST.Lang.isArray(a) ? {
                             array: a
                         }: a;
                         try {
                             r = cache[_y]?cache[_y]:cache[_y]=z(y || w, b); //.replace(/\\([{}])/g, '$1');
                         }catch(t) {
                             return "数据格式错误!";
                         }
                         return r(a);
                     };
                 return {
                     using: function(a, c, d) {
                         w = (d=document.getElementById(a))? d.innerHTML : a;
                         w = (w + '').replace(/\s+/g,' ');
                         if (c) this.fetch(c);
                         return this
                     },
                     getString: function() {
                         return y || w
                     },
                     fetch: function(a, c) {
                         if(!w)this.using('ST_temp');
                         if (w) c = w.match(new RegExp('{' + a + '}([\\s\\S]*?){/' + a + '}'));
                         if (!c) throw new Error('no tpl blk:' + a);
                         y = c[1];
                         _y = a;
                         return this
                     },
                     delTemp: function() {
                         y = '';
                         w='';
                         return this
                     },
                     getFilled: function(a) {
                         a = a || {};
                         return x(a, this)
                     },
                     toFill: function(a, b, c) {
                         c = this;
                         if(a=document.getElementById(a))
                             a.innerHTML=c.getFilled(b);
                         return c
                     },
                     onError: function(a, b) {
                         return "数据错误!";
                     },
                     key: 'context'
                 }
             }())
         };

    })();
    return ST;
});