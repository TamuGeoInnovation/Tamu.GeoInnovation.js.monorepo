import { Component } from '@angular/core';

export const REV_ASCII = `                                                            -:.  -yh+\`                              
                                                           \`hdhy+hy/yh-                             
                                                           /dh.-yd- \`sh.                            
                                                           yds:s\`/h: .do                            
                                                           ydy:dy-/d:\`shyo/-                        
                                                         ./hdd+hdh./syyo+++yho-                     
                                                        ohhyddhhdy  \`\`\`..\` \`.+hy/-\`                 
                                                       +dh:hdhdddy       ./o+\`.+syhyo/-\`            
                                                      /dd:.dddddhdyo++/- \`.-:\`  \`\`.:+oshyo/-        
                                                    :ydd+ -ddddddddds:\`               \`\`:ddhy.      
                                                  /yhs/. -hdddddddd-          \`\`         /ydo\`      
                                                 -hhh:  /hddddddddd+       .yhysooo+++//+yd/     Howdy!   
                                                :hdh- -osohddddddddh/\`     \`:.-:://+osyyyy+         
                                              -yhds-  \`\`\`\`sddddddddddyso+- .oyhhys+/::-.\`\`          
                                             /hds:\`    \`/ydddddddddddddddd.\`/hdh:                   
                                            \`hhds:\`   -hdddddddddddddddhhds\` -ydh:                  
                                           -ydhh..-   ++/:::+shddddddddd:-:-  \`ohho.                
                                          :hdddhoh/   \`      \`:oddddddddh:      -yhy-               
                                          hddddddds\`-/++-    :hhdddddddhs+.      \`sdh-              
                                         \`dddddddddhddddho-  \`odddddddy:\`       \`oodhy              
                                        \`+ddddddddddddddddhs/--/yddddddhyo+-.    -hddy\`             
                                       \`odddddddddddddddddddddhhhddddddddddhhs-   +dd+              
                                      :ydddddddhddddddddyyhhhddddo:-----:/osydd+\` \`hhy              
                                    :sdddhhdddddddddddddy:...+hddh/\`        \`-+y:  odd\`             
                                 ./ydddho-/ddddddddddddddho.  .ohhdy/.\` :/:-.\` \`-  :dd\`             
                               -oydddy+.\`  sdddddddddddddddh+.  .ohddhyshdddhy:    :dd\`             
                            ./yhdddy/\`\`:y/+hhydddddddddddddhhh/   .ohdddddddddh.   /dd              
                         ./shddddy:\`  odddddo.ydddddddddddddy+.  ./ohdddddddddd/ :+sdh              
                      ./shdddddy:\`./- .hd+:s++/hddddddddddy:\` \`/shdddddhs++dddd- /dddo              
                    :shddhdddh:\` /ydy. -hy:++oy/hdddddddh+\` \`+ydddddddy-\` .dddh\` :dd+.              
                  .shhdddddddh- \`sdddy. :hh/ohdhddddddds.  :yddddddddd+   .dddh\` :dd/               
                 :hdhdddddddddh/ohydddy. :hhyddddddddh/\` .oddddddddddd/   .ddddo +dd:               
                :hdo+dddddddddddd+.ohddy- :s+dddddddo. \`/hdddddddddddd.   -ddhdd/sdd.               
               .hdo \`ydddddddddddh-:+/ydh.  \`oddddy:  .sddddddddddo/hd\`   odddddhhdo                
               oddo  :dddddddddddd-ydsdds\`\`:ydddho\` \`/hddddddddddd. .:\`  .ddddddddh.                
              \`hddd-  /ddddddddddd+ydddddoyddddy-  -sddddddddddddd/      -dddddd+s-                 
            \`./ddddh-  /hddddddddddddddddddddh/\` \`+hddddddddddddddy       sddddd:                   
         ./syhdhhhddh:  -shddddddddddddddddh+. \`/ydddddddddddh::hdd/.\`    .ddddd+                   
       -shdhyo/-..ydddo.  -+shhdddddddhhy+:\` \`:ydddddddddddy+.  .ohdds\`    +dhdhs                   
     .oddy+-\`   \`/yddddh+.\`  \`--::/::-.\`  \`-+ydddhddddddy+-\`      -yddo\`   \`yhdhd-                  
    :hdh+\`     \`ydddddddddyo/:..\`\`\`\`\`..:+oyhddhy/+dddho-\`          \`+ddo\`   :ddhds\`                 
   /hddy:\`.+-   .:+ooooooyhdddddhhhhhdddddhhs+-\`/ddh+.               +ddo\`   oddddys+:.\`            
   -yds\`\`+hhyo-\`          ./shddddddddho+:-\` \`.odh+\`   \`\`\`\`\`\`         +dd+   \`hddddddhhyo\`          
   +dh\`\`syhhhhhs+-.-::.\`    \`-sddhshdh.   \`./shhdyooooosyyyyys:\`       /hd+   .+shhddddddy\`         
  \`hd+ -+ohhhhhhhhhhhhho-\`  \`/shds-.:/    :hhhhhhhhhysssyhdddddo        :hd/\`    \`-+hhhhy:          
  .dd+  :hhhhhhhhhhhhhhhhs/.\`  -oyhyo/.\`   \`..--:-.\`     .+ddy+\`         -yhy+-     :dh-            
  \`hhy\` -yyhs//oyyyhy+++o++/.    \`.:+ydys-\`\`\`\`\`\`\`\`\`\`\`\`\`\`\`.ohh-            \`:shhs+//+shh/            
   /hho.\`\`---.  \`.---\` .-\`\`\` \`/+oosyhhhdhyyyyyyyyyyyyyyyyhh+.                .:/+osso/.             
    :yhhso/::/++ossoo//+hhysssydddoo+/::/+++/:::----------\`                                         
      -/+ssssso+//+osssssoosssso+/-`;

@Component({
  selector: 'tamu-gisc-reveille-console-log',
  templateUrl: './reveille-console-log.component.html',
  styleUrls: ['./reveille-console-log.component.scss']
})
export class ReveilleConsoleLogComponent {
  constructor() {
    console.log(REV_ASCII);
  }
}
