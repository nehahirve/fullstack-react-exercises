class TimersDashboard extends React.Component {
  state = {
    timers: [
      {
        title: 'one',
        project: 'projectone',
        id: uuid.v4(),
        elapsed: 5456099,
        runningSince: Date.now()
      },
      {
        title: 'two',
        project: 'projecttwo',
        id: uuid.v4(),
        elapsed: 1273998,
        runningSince: null
      }
    ]
  }

  updateTimer = attrs => {
    console.log('updated')
    this.setState({
      timers: this.state.timers.map(timer => {
        return timer.id === attrs.id
          ? Object.assign({}, timer, {
              title: attrs.title,
              project: attrs.project
            })
          : timer
      })
    })
  }

  createTimer = timer => {
    this.setState({
      timers: this.state.timers.concat({
        title: timer.title,
        project: timer.project,
        id: uuid.v4(),
        elapsed: 0
      })
    })
  }

  deleteTimer = id => {
    this.setState({
      timers: this.state.timers.filter(timer => timer.id !== id)
    })
  }

  toggleTimerRunning = id => {
    this.setState({
      timers: this.state.timers.map(timer => {
        if (timer.id === id) {
          return timer.runningSince
            ? Object.assign({}, timer, {
                elapsed: timer.elapsed + (Date.now() - timer.runningSince),
                runningSince: null
              })
            : Object.assign({}, timer, { runningSince: Date.now() })
        } else return timer
      })
    })
  }

  render() {
    return (
      <div className='ui three column centered grid'>
        <div className='column'>
          <EditableTimerList
            toggleTimerRunning={this.toggleTimerRunning}
            updateTimer={this.updateTimer}
            timers={this.state.timers}
            deleteTimer={this.deleteTimer}
          />
          <ToggleableTimerForm createTimer={this.createTimer} />
        </div>
      </div>
    )
  }
}

class EditableTimerList extends React.Component {
  render() {
    const timers = this.props.timers.map(timer => (
      <EditableTimer
        toggleTimerRunning={this.props.toggleTimerRunning}
        updateTimer={this.props.updateTimer}
        deleteTimer={this.props.deleteTimer}
        key={timer.id}
        id={timer.id}
        title={timer.title}
        project={timer.project}
        elapsed={timer.elapsed}
        runningSince={timer.runningSince}
      />
    ))

    return <div id='timers'>{timers}</div>
  }
}

class EditableTimer extends React.Component {
  state = { isOpen: false }

  toggleFormOpen = () => this.setState({ isOpen: !this.state.isOpen })

  updateTimer = timer => {
    this.props.updateTimer(timer)
    this.toggleFormOpen()
  }

  render() {
    if (this.state.isOpen) {
      return (
        <TimerForm
          id={this.props.id}
          cancelForm={this.toggleFormOpen}
          submitForm={this.updateTimer}
          title={this.props.title}
          project={this.props.project}
        />
      )
    } else {
      return (
        <Timer
          toggleTimerRunning={this.props.toggleTimerRunning}
          deleteTimer={this.props.deleteTimer}
          id={this.props.id}
          title={this.props.title}
          project={this.props.project}
          elapsed={this.props.elapsed}
          runningSince={this.props.runningSince}
          openForm={this.toggleFormOpen}
        />
      )
    }
  }
}

class TimerForm extends React.Component {
  state = { title: this.props.title || '', project: this.props.project || '' }

  updateTitleField = e => this.setState({ title: e.target.value })
  updateProjectField = e => this.setState({ project: e.target.value })

  submitForm = () =>
    this.props.submitForm({
      id: this.props.id,
      title: this.state.title,
      project: this.state.project
    })

  render() {
    const submitText = this.props.id ? 'Update' : 'Create'
    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='ui form'>
            <div className='field'>
              <label>Title</label>
              <input
                type='text'
                value={this.state.title}
                onChange={this.updateTitleField}
              />
            </div>
            <div className='field'>
              <label>Project</label>
              <input
                type='text'
                value={this.state.project}
                onChange={this.updateProjectField}
              />
            </div>
            <div className='ui two bottom attached buttons'>
              <button
                className='ui basic blue button'
                onClick={this.submitForm}
              >
                {submitText}
              </button>
              <button
                className='ui basic red button'
                onClick={this.props.cancelForm}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class Timer extends React.Component {
  componentDidMount() {
    this.updateInterval = setInterval(() => this.forceUpdate(), 50)
  }

  componentWillUnmount() {
    clearInterval(this.updateInterval)
  }

  deleteTimer = () => this.props.deleteTimer(this.props.id)

  toggleTimerRunning = () => this.props.toggleTimerRunning(this.props.id)

  render() {
    const elapsedString = helpers.renderElapsedString(
      this.props.elapsed,
      this.props.runningSince
    )

    return (
      <div className='ui centered card'>
        <div className='content'>
          <div className='header'>{this.props.title}</div>
          <div className='meta'>{this.props.project}</div>
          <div className='center aligned description'>
            <h2>{elapsedString}</h2>
          </div>
          <div className='extra content'>
            <span className='right floated edit icon'>
              <i className='edit icon' onClick={this.props.openForm} />
            </span>
            <span className='right floated trash icon'>
              <i className='trash icon' onClick={this.deleteTimer} />
            </span>
          </div>
        </div>
        <TimerActionButton
          toggleTimerRunning={this.toggleTimerRunning}
          isRunning={!!this.props.runningSince}
        />
      </div>
    )
  }
}

class TimerActionButton extends React.Component {
  render() {
    if (this.props.isRunning) {
      return (
        <div
          className='ui bottom attached red basic button'
          onClick={this.props.toggleTimerRunning}
        >
          Stop
        </div>
      )
    } else {
      return (
        <div
          className='ui bottom attached green basic button'
          onClick={this.props.toggleTimerRunning}
        >
          Start
        </div>
      )
    }
  }
}

class ToggleableTimerForm extends React.Component {
  state = { isOpen: false }

  toggleFormOpen = () => this.setState({ isOpen: !this.state.isOpen })

  render() {
    if (this.state.isOpen) {
      return (
        <TimerForm
          cancelForm={this.toggleFormOpen}
          submitForm={this.props.createTimer}
        />
      )
    } else {
      return (
        <div className='ui basic content center aligned segment'>
          <button
            className='ui basic button icon'
            onClick={this.toggleFormOpen}
          >
            <i className='plus icon' />
          </button>
        </div>
      )
    }
  }
}

ReactDOM.render(<TimersDashboard />, document.querySelector('#content'))
