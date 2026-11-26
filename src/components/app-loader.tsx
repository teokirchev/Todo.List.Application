import { FootballIcon } from "@/components/club-emblem";

/**
 * Full-screen loading screen: a football doing keepy-uppies over a dimmed, blurred page.
 * It is in the server HTML, so it shows from the first paint; LOADER_SCRIPT fades it out
 * once the page, the todos, the fonts and the team's crest and symbol have loaded.
 */
export function AppLoader() {
  return (
    <div role='status' className='app-loader fixed inset-0 z-100 flex flex-col items-center justify-center gap-6 bg-zinc-950/70 text-white backdrop-blur-sm'>
      <div className='relative flex h-36 w-20 flex-col items-center justify-end'>
        <div className='app-loader-ball absolute bottom-3 size-16'>
          <FootballIcon className='size-full drop-shadow-lg' />
        </div>
        <span className='app-loader-shadow h-2.5 w-14 rounded-full bg-black/60 blur-[2px]' />
      </div>
      <p className='font-display text-xl font-bold tracking-[0.3em] uppercase'>Загрявка…</p>
    </div>
  );
}

/**
 * Runs in <head>. Marks <html data-loaded> (which fades the loader out) after the window "load" event,
 * the web fonts and the team's crest and symbol images (from --team-crest / --team-symbol).
 * Gives up waiting after 10 s so a slow image can never lock the app.
 */
export const LOADER_SCRIPT = `(function(){
var d=document.documentElement,done=false;
function hide(){if(!done){done=true;d.setAttribute("data-loaded","");}}
setTimeout(hide,10000);
function image(src){return new Promise(function(r){var i=new Image();i.onload=i.onerror=r;i.src=src;});}
window.addEventListener("load",function(){
var s=getComputedStyle(d),waits=[document.fonts?document.fonts.ready:null];
["--team-crest","--team-symbol"].forEach(function(v){var m=/url\\(["']?([^"')]+)/.exec(s.getPropertyValue(v));if(m)waits.push(image(m[1]));});
Promise.all(waits).then(hide,hide);
});
})()`;
