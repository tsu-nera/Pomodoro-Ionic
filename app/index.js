import clock from 'clock'
import {vibration} from 'haptics'
import {display} from 'display'
import * as buttons from 'buttons'
import * as views from 'views'
import {PomodoroTimer} from 'pomodoro'
import {CONFIG} from 'config'
import {me} from 'appbit'

/* DEBUGGING: Read and show stored pomo file. Uncomment this part if you need to
 * inspect the stored file.
import * as fs from 'fs'
try {
  let data = fs.readFileSync(CONFIG.pomodoroTimerPath, 'cbor')
  console.log(data.settings.work)
  console.log(data.settings.rest)
  console.log(data.settings.longRest)
  console.log(data.settings.longRestAfter)
  console.log(data.settings.totalIntervals)
  console.log(data.internalStates.notifyTimerHandler)
  console.log(data.internalStates.timerState)
  console.log(data.internalStates.intvlState)
  console.log(data.internalStates.doneIntvls)
  console.log(data.internalStates.startedAt)
  console.log(data.internalStates.pausedAt)
  console.log(data.internalStates.countdown)
  console.log(data.internalStates.intvlMarker.ts)
  console.log(data.internalStates.intvlMarker.state)
  console.log(data.internalStates.intvlMarker.intvl)
} catch (e) {
  console.log('DEBUGGING: Faild to load file.')
}
*/

// App closing handler
me.addEventListener('unload', (evt) => {
  console.log('App closing. Store current pomodoro state...')
  pomo.saveToFile(CONFIG.pomodoroTimerPath)
  console.log('Finished.')
})

console.log('Loading PomodoroTimer from file...')
let pomo = PomodoroTimer.loadFromFile(CONFIG.pomodoroTimerPath)
if (!pomo) {
  console.log('Failed. Create new PomodoroTimer.')
  pomo = new PomodoroTimer(CONFIG.pomodoroSettings)
}
console.log('Adding notification handler to PomodoroTimer.')
pomo.onnotify = () => {
  console.log('NOTIFY!!!')
  vibration.start('nudge')
  display.on = true
}

clock.granularity = 'seconds'
// Update current time
clock.addEventListener('tick', (evt) => {
  views.datetime(evt.date)
})
// Update Pomodoro view
clock.addEventListener('tick', (evt) => {
  pomo.update(evt.date)
  views.pomodoro(pomo)
})

buttons.reset().addEventListener('click', (evt) => {
  console.log('reset')
  vibration.start('confirmation')
  views.hideOptionsMenu()

  console.log('Reset. Create new PomodoroTimer.')
  pomo.reset() // This is required to clear the notify timer
  pomo = new PomodoroTimer(CONFIG.pomodoroSettings)
  console.log('Adding notification handler to PomodoroTimer.')
  pomo.onnotify = () => {
    console.log('NOTIFY!!!')
    vibration.start('nudge')
    display.on = true
  }
  views.pomodoro(pomo)
})

buttons.skip().addEventListener('click', (evt) => {
  console.log('skip')
  vibration.start('confirmation')
  views.hideOptionsMenu()

  pomo.skip()
  pomo.update()
  views.pomodoro(pomo)
})

buttons.toggle().addEventListener('click', (evt) => {
  console.log('toggle')
  vibration.start('confirmation')
  pomo.toggle()
  pomo.update()
  views.pomodoro(pomo)
})

buttons.stat().addEventListener('click', (evt) => {
  console.log('stat. Do nothing right now.')
  vibration.start('confirmation')
})

buttons.flag().addEventListener('click', () => {
  console.log('flag.')
  vibration.start('confirmation')
  views.showOptionsMenu()
  // Close after 3 seconds
  setTimeout(() => {
    views.hideOptionsMenu()
  }, 2000)
})
