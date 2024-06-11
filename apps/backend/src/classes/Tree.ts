// type Permission = 'read' | 'write' | 'delete'

// const PERMISSION_SYMBOL = Symbol('permissions')

// interface NodeValue {
//   service: string
//   [PERMISSION_SYMBOL]: Permission[]
// }

// export class Node {
//   public readonly value: NodeValue
//   public readonly child: Node | null
//   public readonly parent: Node | null

//   constructor(
//     value: NodeValue,
//     child: Node | null = null,
//     parent: Node | null = null,
//   ) {
//     this.value = value
//     this.child = child
//     this.parent = parent
//   }

//   static createNodeValue(service: string, permissions: Permission[]): NodeValue {
//     return Object.defineProperty({ service }, PERMISSION_SYMBOL, {
//       value: permissions,
//       enumerable: false,
//       writable: false,
//     }) as NodeValue
//   }
// }

// interface NewTreeArgs {
//   service: string
//   permissions: Permission
// }

// type GroupByServiceReturn = Array<{
//   service: string
//   permissions: Permission[]
// }>

// export class Tree {
//   readonly #root = new Node(Node.createNodeValue('api', []))

//   constructor(args: NewTreeArgs[]) {

//   }

//   /**
//    * @description This is done, because I don't know how the query will look like
//    */
//   #groupByService(args: NewTreeArgs[]) {
//     return args.reduce((accumulator, current) => {
//       const foundService = accumulator.find(({ service }) => service === current.service)

//       if (foundService === undefined) {
//         accumulator.push({ service: current.service, permissions: [current.permissions] })
//         return accumulator
//       }

//       foundService.permissions.push(current.permissions)

//       return accumulator
//     }, [] as GroupByServiceReturn)
//   }

//   #parseServices (args: GroupByServiceReturn) {
//     const currentNode = this.#root

//     for (const { service, permissions } of args) {
//       const paths = service.split('.')

//       for (let i = 0; i < paths.length; i++) {
//         if (i === paths.length + 1) {
//           // link
//         } else {
//           if (currentNode === path) {

//           }
//         }
//       }
//     }
//   }
// }
