import { useState } from "react"
import { IconGripVertical } from "@tabler/icons-react"
import { Box, Flex, Group, Menu, Table, Text, useMantineTheme } from "@mantine/core"
import { modals } from "@mantine/modals"
import { sum, uniq } from "ramda"
import { useBalanceError } from "../../firebase/calc"
import { useBalance } from "../../firebase/read"
import { BalanceController } from "../../firebase/write"
import { promptNumber } from "../../data/utils"
import AddButton from "./AddButton"
import DeleteButton from "./DeleteButton"
import SetAccountForm from "./SetAccountForm"

interface Props {
  title: string
  balanceKey: BalanceKey
}

const BalanceItemTable = ({ title, balanceKey }: Props) => {
  const { colors } = useMantineTheme()
  const balanceError = useBalanceError()
  const balance = useBalance()
  const balanceController = new BalanceController(balanceKey)
  const accounts = balance[balanceKey] ?? []

  const categories = uniq(accounts.map(({ category }) => category).filter(Boolean))
  const hasCategory = categories.length > 0
  const [showDragHandle, setShowDragHandle] = useState(false)

  const rows = accounts.map((account) => {
    const { category = "", name, amount } = account

    const categoryIndex = categories.indexOf(category)
    const color = ["red", "green", "orange", "cyan", "grape", "teal", "yellow", "indigo", "gray"][categoryIndex]

    const open = () => {
      modals.open({
        title: (
          <DeleteButton title={name} onDelete={() => balanceController.deleteAccount(account)}>
            {name}
          </DeleteButton>
        ),
        children: <SetAccountForm balanceKey={balanceKey} initial={account} />,
      })
    }

    const edit = () => {
      promptNumber(title, amount, async (amount) => balanceController.updateAccount(account, { amount }))
    }

    const auto = () => {
      const next = balanceKey === "custody" ? amount + balanceError : amount - balanceError
      balanceController.updateAccount(account, { amount: next })
    }

    return (
      <Table.Tr key={JSON.stringify(account)}>
        <Table.Td hidden={!showDragHandle}>
          <Flex>
            <IconGripVertical size="1rem" stroke={1.5} />
          </Flex>
        </Table.Td>

        {hasCategory && (
          <Table.Td onClick={open}>
            <Text c={colors[color]?.[3]} fz="sm">
              {category}
            </Text>
          </Table.Td>
        )}

        <Table.Td onClick={open}>{name}</Table.Td>

        <Table.Td align="right">
          {balanceError ? (
            <Menu>
              <Menu.Target>
                <Text>{amount.toLocaleString()}</Text>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item onClick={edit}>편집</Menu.Item>
                <Menu.Item onClick={auto}>자동</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Text onClick={edit}>{amount.toLocaleString()}</Text>
          )}
        </Table.Td>
      </Table.Tr>
    )
  })

  const total = sum(accounts.map(({ amount }) => amount)).toLocaleString()

  return (
    <Box>
      <Table>
        <Table.Caption>
          <Group justify="space-between">
            <Text onClick={() => setShowDragHandle((value) => !value)}>
              {title} {total}
            </Text>
            <AddButton title={title}>
              <SetAccountForm balanceKey={balanceKey} />
            </AddButton>
          </Group>
        </Table.Caption>

        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Box>
  )
}

export default BalanceItemTable
