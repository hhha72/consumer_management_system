import React, { Component } from 'react';
import Customer from './components/Customer'
import './App.css';
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import CircularProgress from '@material-ui/core/CircularProgress'
import {withStyles} from '@material-ui/core/styles'
import CustomerAdd from './components/CustomerAdd';
import MenuIcon from '@material-ui/icons/Menu';
import SearchIcon from '@material-ui/icons/Search';
import InputBase from '@material-ui/core/InputBase';
import { fade } from '@material-ui/core/styles/colorManipulator';
import Typography from '@material-ui/core/Typography';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';


const styles = theme=>({
  root : {
    widrth: '100%',
    minWidth: 1080,
    marginTop: theme.spacing.unit*3,
    overflowX: 'auto'
  }, 
  menu: {
    marginTop: 15,
    marginBottom: 15,
    display: 'flex',
    justifyContent: 'center'
  },
  paper: {
    marginLeft: 18,
    marginRight: 18
  },
  progress: {
    margin: theme.spacing.unit * 2
  },
  grow: {
    flexGrow: 1,
  },
  tableHead: {
    fontSize: '1.0rem'
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  search: {
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing.unit,
      width: 'auto',
    },
  },
  searchIcon: {
    width: theme.spacing.unit * 9,
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputRoot: {
    color: 'inherit',
    width: '100%',
  },
  inputInput: {
    paddingTop: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    paddingBottom: theme.spacing.unit,
    paddingLeft: theme.spacing.unit * 10,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: 120,
      '&:focus': {
        width: 200,
      },
    },
  }
});

var loading = false;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      customers:[],
      completed:0,
      searchKeyword:''
    };
    this.refreshState = this.refreshState.bind(this);
    this.handleValueChange = this.handleValueChange.bind(this);
  }

  refreshState() {
    this.setState({
      customers:[],
      completed:0,
      searchKeyword:''
    });
    this.timer = setInterval(this.progress, 20);
    this.callCustomersApi()
      .then(res => {
        this.setState({customers:res}); 
        //clearInterval(this.timer);
        loading = false;
      })
      .catch(err => console.log(err));
  }

  componentDidMount(){
    this.refreshState();
  }

  callCustomersApi = async() => {
    loading = true;
    const response = await fetch('/api/customers');
    const body = await response.json();
    console.log("Response: " + body);
    return body;
  }

  componentWillUnmount() {
    clearInterval(this.timer);
  }

  progress = () => {
    const { completed } = this.state;
    this.setState({completed: completed > 100 ? 0:completed + 1});
  }

  handleValueChange(e) {
    var updateState = {};
    console.log("name: " + e.target.name);
    console.log("value: " + e.target.value);
    updateState[e.target.name] = e.target.value;
    this.setState(updateState);
  }

  filteredComponents = (data) => {
    if (data.length <= 0) {
      return '';
    }
    data = data.filter((c) => {
      return c.name.indexOf(this.state.searchKeyword) >= 0;
    })
    return data.map((c) => {
      return <Customer refreshState={this.refreshState} key={c.id} id={c.id} image={c.image} name={c.name} birthday={c.birthday} gender={c.gender} job={c.job}/>
    });
  }

  render() {
    const cellList = ['번호','사진','이름','생년월일','성별','직업','설정'];
    const {classes} = this.props;
    return (
      <div className={classes.root}>
        <AppBar position="static">
        <Toolbar>
          <IconButton className={classes.menuButton} color="inherit" aria-label="Open drawer">
            <MenuIcon />
          </IconButton>
          <Typography className={classes.title} variant="h6" color="inherit" noWrap>
            고객 관리 시스템
          </Typography>
          <div className={classes.grow} />
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="검색하기"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              name='searchKeyword'
              value={this.state.searchKeyword}
              onChange={this.handleValueChange}
            />
          </div>
          </Toolbar>
        </AppBar>
        <div className={classes.menu}>
          <CustomerAdd refreshState={this.refreshState} />
        </div>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                {
                  cellList.map((c)=>{
                    return <TableCell className={classes.tableHead}>{c}</TableCell>
                  })
                }
              </TableRow>
            </TableHead>
            <TableBody>
              {
                /*
                  !loading ? (this.state.customers.length > 0 ? this.state.customers.map(c => {
                    return <Customer refreshState={this.refreshState} key={c.id} id={c.id} image={c.image} name={c.name} birthday={c.birthday} gender={c.gender} job={c.job}/>
                  }):''):
                  */
                 !loading ? this.filteredComponents(this.state.customers):
                  <TableRow>
                    <TableCell colSpan="7" align="center">
                    <CircularProgress className={classes.progress} variant="determinate" value={this.state.completed} />
                    </TableCell>
                  </TableRow>
              }
            </TableBody>
          </Table>
        </Paper>
      </div>
    );
  }
}

export default withStyles(styles)(App);
