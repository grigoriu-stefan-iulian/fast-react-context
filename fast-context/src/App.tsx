import { useRef, createContext, useContext, useCallback, ReactNode, useSyncExternalStore  } from "react";

type Store = { first: string; last: string };

const useStore = (): {
  get: () => Store;
  set: (value: Partial<Store>) => void;
  subscribe: (callback: () => void) => void;
} => {
  const store = useRef({ 
    first: '',
    last: '',
  });
  const subscribers = useRef(new Set<() => void>());

  const get = useCallback(() => store.current, []);
  const set = useCallback((value: Partial<Store>) => {
    store.current = { ...store.current, ...value };
    subscribers.current.forEach((callback) => callback());
  }, []);

  const subscribe = useCallback((callback: () => void) => {
    subscribers.current.add(callback);

    return () => subscribers.current.delete(callback);
  }, []);


  return {
    get,
    set,
    subscribe,
  };
}

type SelectorOutput = {}

type MyContextType = [
  SelectorOutput, 
  (value: Partial<Store>) => void, 
  (callback: () => void) => void,
];

const useMyContext = (selector: (store: Store) => SelectorOutput): MyContextType => {
  const store = useContext(MyContext);

  if(!store) {
    throw new Error('Store not found')
  }

// const [subscribeState, setSubscribeState] = useState(store.get());

// useEffect(() => {
//   return store.subscribe(() => setSubscribeState(store.get()));
// }, []);

const subscribeState = useSyncExternalStore(store.subscribe, () => selector(store.get()));

  return [
    subscribeState,
    store.set,
    store.subscribe,
  ];
};

type UseStoreDataReturnType = ReturnType<typeof useStore>;

const MyContext = createContext<UseStoreDataReturnType| null>(null);

const Provider = ({children}: {children: ReactNode}) => {
  return (
    <MyContext.Provider value={useStore()}>
      {children}
    </MyContext.Provider>
  )
};

const TextInput = ({ value }: { value: "first" | "last" }) => {
  const [ fieldValue, setStore ] = useMyContext(store => store[value])!

  return (
    <div className="field">
      {fieldValue}: (
        <input 
          value={fieldValue} 
          onChange={(e) => setStore({[value]: e.target.value})}
          />
        )
    </div>
  );
};

const Display = ({ value }: { value: "first" | "last" }) => {
  const [ fieldValue ] = useMyContext(store => store[value])!

  return (
    <div className="value">
      {value}: fieldValue
    </div>
  );
};

const FormContainer = () => {
  return (
    <div className="container">
      <h5>FormContainer</h5>
      <TextInput value="first" />
      <TextInput value="last" />
    </div>
  );
};

const DisplayContainer = () => {
  return (
    <div className="container">
      <h5>DisplayContainer Test</h5>
      <Display value="first" />
      <Display value="last" />
    </div>
  );
};

const ContentContainer = () => {
  return (
    <div className="container">
      <h5>ContentContainer</h5>
      <FormContainer />
      <DisplayContainer />
    </div>
  );
};

function App() {
  return (
    <Provider>
      <div className="container">
        <h5>App</h5>
        <ContentContainer />
      </div>
    </Provider>
  );
}

export default App;
