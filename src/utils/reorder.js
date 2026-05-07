export function arrayMove(arr, fromIndex, toIndex) {
  const newArr = arr.slice()
  const [moved] = newArr.splice(fromIndex, 1)
  newArr.splice(toIndex, 0, moved)
  return newArr
}

// find parent container for an item id and return { parent, index, path }
export function findItemPath(items, id, parentId = null, path = []) {
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    if (it.id === id) return { parent: items, parentId, index: i, path: [...path, i] }
    if (it.children && it.children.length) {
      const res = findItemPath(it.children, id, it.id, [...path, i, 'children'])
      if (res) return res
    }
  }
  return null
}

// move item within same parent array
export function moveWithinParent(items, parentPath, fromIndex, toIndex) {
  // navigate to parent
  const parent = parentPath.reduce((acc, key) => acc[key], items)
  const newParent = arrayMove(parent, fromIndex, toIndex)
  // reconstruct full items
  const clone = JSON.parse(JSON.stringify(items))
  let target = clone
  for (let i = 0; i < parentPath.length - 1; i++) target = target[parentPath[i]]
  // parentPath last points to array; set it
  const lastKey = parentPath[parentPath.length - 1]
  target[lastKey] = newParent
  return clone
}

// Remove an item by id anywhere in the tree; returns { item, newTree }
export function removeById(items, id) {
  let removed = null
  function recurse(list) {
    const out = []
    for (const it of list) {
      if (it.id === id) {
        removed = it
        continue
      }
      if (it.children && it.children.length) {
        const res = recurse(it.children)
        out.push({ ...it, children: res })
      } else {
        out.push(it)
      }
    }
    return out
  }
  const newTree = recurse(items)
  return { item: removed, newTree }
}

// Insert an item into a parent identified by parentId (or root if null) at index
export function insertAt(items, parentId, index, itemToInsert) {
  if (!parentId) {
    const clone = items.slice()
    clone.splice(index, 0, itemToInsert)
    return clone
  }
  function recurse(list) {
    return list.map(node => {
      if (node.id === parentId) {
        const children = Array.isArray(node.children) ? node.children.slice() : []
        children.splice(index, 0, itemToInsert)
        return { ...node, children }
      }
      if (node.children && node.children.length) {
        return { ...node, children: recurse(node.children) }
      }
      return node
    })
  }
  return recurse(items)
}

// Move an item across parents (including within same parent) by id and destination parent/index
export function moveItemAcrossParents(items, sourceId, destParentId, destIndex) {
  const { item, newTree } = removeById(items, sourceId)
  if (!item) return items
  const result = insertAt(newTree, destParentId, destIndex, item)
  return result
}
