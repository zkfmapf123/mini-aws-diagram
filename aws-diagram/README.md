# aws-mini-diagram

## execute (local)

```sh
    npm install
    npm run start
```

## execute (docker)

```sh
    docker build -t diagram . && docker run --rm -d -p 80:80 diagram
    or
    npm run docker
```

## 데이터 구조

```ts
//diagram
diagram : {
    id : string
    name : string
    description : string
    resource : resource
    connections: connections
}

// connections
connections : []struct{
    id : string
    source : string
    target: string
    label : string
}

// resources
resources : []struct{
    id : ssring
    type : AWSParams
    name : string
    description : string
}
```
